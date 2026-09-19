import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Language } from '../geneInfo'

type CellPart = 'membrane' | 'nucleus' | 'mitochondria'
// Restrained biological colors against the graphite UI. Not a gene-response map.
const MEMBRANE_COLOR = '#B5C9B9'
const NUCLEUS_COLOR = '#77748E'
const MITO_COLOR = '#B69880'
type Props = {language:Language;compact?:boolean;target?:string}
const copy={
 TR:{membrane:'Hücre zarı',nucleus:'Çekirdek',mitochondria:'Mitokondri',about:'Hücrenin içine bak',how:'Sürükleyin · yakınlaştırın · bir yapı seçin',illustration:'Temsili 3D hücre illüstrasyonu; seçilen genin ölçülmüş etkisi değil.'},
 EN:{membrane:'Cell membrane',nucleus:'Nucleus',mitochondria:'Mitochondrion',about:'Look inside the cell',how:'Drag · zoom · select a structure',illustration:'Illustrative 3D cell, not a measured effect of the selected gene.'},
}
const organelles:[number,number,number,number,number][]=[
 [-1.58,.12,.18,.28,.1],[-1.22,-.18,.25,.24,-.5],[-.78,.26,.35,.22,.7],
 [.67,.16,.37,.23,-.6],[1.12,-.2,.25,.27,.6],[1.63,.05,.12,.24,-.2],
 [.28,-.27,.38,.19,1.2],[-.45,-.32,.33,.16,.4],
]
function MembraneGeometry(){
 const geometry=useMemo(()=>{
  const g=new THREE.SphereGeometry(1,120,80),p=g.attributes.position
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i)
   const taper=Math.pow(Math.max(.24,1-Math.pow(Math.abs(x),1.45)),.32)
   const noise=1+.055*Math.sin(x*11+z*7)*Math.cos(y*9)+.025*Math.sin(x*27+y*14)
   p.setXYZ(i,x*3.03*noise,y*.77*taper*noise,z*.97*taper*noise)
  }
  g.computeVertexNormals();return g
 },[])
 return <primitive attach="geometry" object={geometry}/>
}
function Filaments(){
 const fibers=useMemo(()=>Array.from({length:21},(_,i)=>{
  const a=i*2.4
  const pts=Array.from({length:32},(_,j)=>{const t=j/31, x=-2.55+t*5.1, taper=Math.sin(Math.PI*t)
   return new THREE.Vector3(x,Math.sin(a)*.23*taper+.047*Math.sin(t*19+a), .18+Math.cos(a)*.38*taper+.028*Math.cos(t*13+a))})
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),64,.0038,4,false)
 }),[])
 return <group>{fibers.map((g,i)=><mesh key={i} geometry={g}><meshBasicMaterial color={i%3?'#8C9D90':'#6C756C'} transparent opacity={.42}/></mesh>)}</group>
}
function Reticulum(){
 const coils=useMemo(()=>Array.from({length:7},(_,i)=>{
  const radius=.72+i*.09
  const points=Array.from({length:80},(_,j)=>{
   const t=j/79*Math.PI*2
   return new THREE.Vector3(-.06+Math.cos(t)*radius,Math.sin(t)*(.23+i*.013),.11+Math.sin(t*3+i)*.095)
  })
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),110,.013,5,false)
 }),[])
 return <group>{coils.map((coil,i)=><mesh key={i} geometry={coil}><meshStandardMaterial color={i%2?'#B9B1B4':'#C8BFC1'} transparent opacity={.6} roughness={.75}/></mesh>)}</group>
}
function Nucleus({active,onSelect}:{active:boolean;onSelect:()=>void}){
 return <group position={[-.04,0,.12]} onClick={e=>{e.stopPropagation();onSelect()}}>
  <mesh scale={[.65,.43,.53]}><sphereGeometry args={[1,56,44]}/><meshPhysicalMaterial color={active?'#554D70':NUCLEUS_COLOR} roughness={.5} metalness={.02} clearcoat={.23}/></mesh>
  <mesh position={[.02,.01,.02]} scale={[.69,.47,.57]}><sphereGeometry args={[1,56,44]}/><meshPhysicalMaterial color="#C7BDD3" transparent opacity={.13} depthWrite={false} side={THREE.BackSide}/></mesh>
  <mesh position={[.20,.07,.46]} scale={[.14,.105,.073]}><sphereGeometry args={[1,32,20]}/><meshStandardMaterial color="#514A67" roughness={.77}/></mesh>
  {Array.from({length:28},(_,i)=>{const a=i*2.4,r=.12+Math.sqrt(i/28)*.33;return <mesh key={i} position={[Math.cos(a)*r,Math.sin(a)*r*.56,.51+Math.sin(i*3)*.015]} scale={i%6===0?.021:.011}><sphereGeometry args={[1,8,8]}/><meshBasicMaterial color="#E7DDEB" transparent opacity={.6}/></mesh>})}
 </group>
}
function Mitochondrion({position,active,onSelect,scale,rotation}:{position:[number,number,number];active:boolean;onSelect:()=>void;scale:number;rotation:number}){
 return <group position={position} rotation={[.2,.3,rotation]} scale={scale} onClick={e=>{e.stopPropagation();onSelect()}}>
  <mesh scale={[1,.42,.47]}><sphereGeometry args={[1,30,22]}/><meshPhysicalMaterial color={active?'#956A51':MITO_COLOR} roughness={.49} clearcoat={.15}/></mesh>
  <mesh scale={[.9,.30,.40]}><sphereGeometry args={[1,28,18]}/><meshStandardMaterial color="#E0C3A6" transparent opacity={.20}/></mesh>
  {Array.from({length:5},(_,i)=><mesh key={i} position={[-.57+i*.28,0,.41]} rotation={[0,0,Math.sin(i*2)*.35]} scale={[.035,.25,.013]}><sphereGeometry args={[1,10,8]}/><meshBasicMaterial color="#765849" transparent opacity={.6}/></mesh>)}
 </group>
}
function Cell({selected,setSelected}:{selected:CellPart;setSelected:(part:CellPart)=>void}){
 return <group rotation={[.1,-.1,-.06]}>
  <Filaments/>
  <Reticulum/>
  <Nucleus active={selected==='nucleus'} onSelect={()=>setSelected('nucleus')}/>
  {organelles.map(([x,y,z,size,angle],i)=><Mitochondrion key={i} position={[x,y,z]} scale={size} rotation={angle} active={selected==='mitochondria'} onSelect={()=>setSelected('mitochondria')}/>)}
  <mesh raycast={() => null}><MembraneGeometry/><meshPhysicalMaterial color={MEMBRANE_COLOR} transparent opacity={selected==='membrane'?.35:.24} side={THREE.DoubleSide} depthWrite={false} roughness={.35} metalness={0} clearcoat={.55} clearcoatRoughness={.25}/></mesh>
  <mesh raycast={()=>null} scale={[2.68,.58,.89]}><sphereGeometry args={[1,72,40]}/><meshPhysicalMaterial color="#E0E7DD" transparent opacity={.060} side={THREE.BackSide} depthWrite={false}/></mesh>
 </group>
}
export default function CellModel({language,compact=false,target}:Props){
 const [selected,setSelected]=useState<CellPart>('nucleus')
 const [fallback,setFallback]=useState(false)
 const t=copy[language]
 return <div className={`cell-experience${compact?' compact':''}`}>
  <div className="cell-viewer" aria-label={language==='TR'?'Etkileşimli temsili fibroblast modeli':'Interactive illustrative fibroblast model'}>{fallback?<div className="cell-static-fallback" role="img" aria-label={t.illustration}><div className="static-cell"><div className="static-nucleus"/></div><p>{t.illustration}</p></div>:<Canvas camera={{position:[0,1.5,7.0],fov:34}} gl={{alpha:true,antialias:true}} dpr={[1,1.7]}><ambientLight intensity={1.6}/><hemisphereLight args={['#ffffff','#bbaea1',1.0]}/><directionalLight position={[5,7,7]} intensity={2.3}/><directionalLight position={[-4,-2,1]} intensity={.55}/><Cell selected={selected} setSelected={setSelected}/><OrbitControls enablePan={false} autoRotate={false} minDistance={4.3} maxDistance={11} enableDamping dampingFactor={.08}/></Canvas>}
   <button className="cell-fallback-toggle" type="button" onClick={()=>setFallback(v=>!v)}>{fallback?(language==='TR'?'3D görünümü aç':'Show 3D view'):(language==='TR'?'Basit görünüm':'Simple view')}</button>
   <div className="cell-viewer-caption"><span>{t.illustration}</span><span>Hs27 / Fibroblast{target?` · ${target}`:''}</span></div>
  </div>
  {!compact&&<div className="cell-information"><span className="information-label">{t.about}</span><div className="cell-controls">{(['membrane','nucleus','mitochondria'] as CellPart[]).map(part=><button key={part} type="button" className={selected===part?'cell-control active':'cell-control'} onClick={()=>setSelected(part)}>{t[part]}</button>)}</div><p className="cell-instruction">{t.how}</p></div>}
 </div>
}
