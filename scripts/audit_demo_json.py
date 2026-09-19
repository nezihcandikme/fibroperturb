"""Sanity-check exported, aggregated guide-capture demo data (not biological validation)."""
from __future__ import annotations
import argparse
import json
import math
from pathlib import Path


def audit(path: Path) -> dict[str, int]:
    payload = json.loads(path.read_text(encoding='utf-8'))
    if payload.get('validated_assignments') is not False:
        raise ValueError('Explorer data must explicitly mark assignments as unvalidated')
    if payload.get('analysis') != 'Exploratory guide-capture summary':
        raise ValueError('Unexpected data analysis label')
    targets = payload.get('targets')
    if not isinstance(targets, list) or not targets:
        raise ValueError('Target list missing or empty')
    if not (0 < payload.get('dominance_threshold', -1) <= 1):
        raise ValueError('Invalid dominance threshold')
    names = set()
    for item in targets:
        name = item['target']
        if not isinstance(name, str) or not name.strip() or name in names:
            raise ValueError(f'Duplicate or blank target name: {name!r}')
        names.add(name)
        for field in ('candidate_cells','unique_top_guides','median_guide_count'):
            value=item[field]
            if not isinstance(value,(int,float)) or not math.isfinite(value) or value < 0:
                raise ValueError(f'Invalid {field} for {name}')
        fraction=item['median_dominance']
        if not isinstance(fraction,(int,float)) or not math.isfinite(fraction) or not 0 <= fraction <= 1:
            raise ValueError(f'Invalid median dominance for {name}')
        if item['candidate_cells'] < payload['minimum_candidate_cells_per_target']:
            raise ValueError(f'Display threshold violated for {name}')
    return {'targets':len(targets),'candidate_cells':sum(t['candidate_cells'] for t in targets)}

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('path',nargs='?',type=Path,default=Path('frontend/public/demo-data/targets.json'))
    args=parser.parse_args()
    print(json.dumps(audit(args.path),indent=2))
