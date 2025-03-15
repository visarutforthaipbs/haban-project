import{c as A,d as E,e as G,S as V,f as H,u as F}from"./chunk-Z3VR2BFQ-gVd_s3GH.js";import{f as m,c as S,j as r,e as j,k as h,o as W,g as $,h as q,r as x,B as Y}from"./index-DaKMN1yZ.js";import{c as X,l as J,b as K}from"./leaflet-C4RW84Ki.js";import{c as Q,M as U,a as Z,b as D}from"./chunk-4FCEGNGT-Dti3ODPF.js";import{b as ee,M as se,S as M}from"./DogListView-DOMIF1io.js";import{H as b}from"./chunk-W7WUSNWJ-xyNjI2Wo.js";import{B as te,T as y}from"./chunk-ZHMYA64R-DpJu8I27.js";import{V as P}from"./index-DCkPA7ii.js";import{H as re}from"./chunk-7OLJDQMT-BqdKiONh.js";import{B as w}from"./chunk-Z6RXEUPO-VoMs9AXz.js";import{I as oe}from"./chunk-QINAG4RG-CdqfM4pg.js";var g=m((s,t)=>{const{title:e,children:n,className:o,...i}=s,l=S("chakra-menu__group__title",o),c=A();return r.jsxs("div",{ref:t,className:"chakra-menu__group",role:"group",children:[e&&r.jsx(j.p,{className:l,...i,__css:c.groupTitle,children:e}),n]})});g.displayName="MenuGroup";var ne=s=>{const{className:t,title:e,...n}=s,o=E(n);return r.jsx(g,{title:e,className:S("chakra-menu__option-group",t),...o})};ne.displayName="MenuOptionGroup";var ae=s=>r.jsx("svg",{viewBox:"0 0 14 14",width:"1em",height:"1em",...s,children:r.jsx("polygon",{fill:"currentColor",points:"5.5 11.9993304 14 3.49933039 12.5 2 5.5 8.99933039 1.5 4.9968652 0 6.49933039"})}),k=m((s,t)=>{const{icon:e,iconSpacing:n="0.75rem",...o}=s,i=G(o,t);return r.jsxs(V,{...i,className:S("chakra-menu__menuitem-option",o.className),children:[e!==null&&r.jsx(H,{fontSize:"0.8em",marginEnd:n,opacity:s.isChecked?1:0,children:e||r.jsx(ae,{})}),r.jsx("span",{style:{flex:1},children:i.children})]})});k.id="MenuItemOption";k.displayName="MenuItemOption";function ie(s,t,e){return(s-t)*100/(e-t)}h({"0%":{strokeDasharray:"1, 400",strokeDashoffset:"0"},"50%":{strokeDasharray:"400, 400",strokeDashoffset:"-100"},"100%":{strokeDasharray:"400, 400",strokeDashoffset:"-260"}});h({"0%":{transform:"rotate(0deg)"},"100%":{transform:"rotate(360deg)"}});var le=h({"0%":{left:"-40%"},"100%":{left:"100%"}}),ce=h({from:{backgroundPosition:"1rem 0"},to:{backgroundPosition:"0 0"}});function ue(s){const{value:t=0,min:e,max:n,valueText:o,getValueText:i,isIndeterminate:l,role:c="progressbar"}=s,a=ie(t,e,n);return{bind:{"data-indeterminate":l?"":void 0,"aria-valuemax":n,"aria-valuemin":e,"aria-valuenow":l?void 0:t,"aria-valuetext":(()=>{if(t!=null)return typeof i=="function"?i(t,a):o})(),role:c},percent:a,value:t}}var[de,pe]=q({name:"ProgressStylesContext",errorMessage:`useProgressStyles returned is 'undefined'. Seems you forgot to wrap the components in "<Progress />" `}),me=m((s,t)=>{const{min:e,max:n,value:o,isIndeterminate:i,role:l,...c}=s,a=ue({value:o,min:e,max:n,isIndeterminate:i,role:l}),d={height:"100%",...pe().filledTrack};return r.jsx(j.div,{ref:t,style:{width:`${a.percent}%`,...c.style},...a.bind,...c,__css:d})}),C=m((s,t)=>{var e;const{value:n,min:o=0,max:i=100,hasStripe:l,isAnimated:c,children:a,borderRadius:u,isIndeterminate:d,"aria-label":_,"aria-labelledby":I,"aria-valuetext":T,title:z,role:L,...O}=W(s),f=$("Progress",s),v=u??((e=f.track)==null?void 0:e.borderRadius),R={animation:`${ce} 1s linear infinite`},B={...!d&&l&&c&&R,...d&&{position:"absolute",willChange:"left",minWidth:"50%",animation:`${le} 1s ease infinite normal none running`}},N={overflow:"hidden",position:"relative",...f.track};return r.jsx(j.div,{ref:t,borderRadius:v,__css:N,...O,children:r.jsxs(de,{value:f,children:[r.jsx(me,{"aria-label":_,"aria-labelledby":I,"aria-valuetext":T,min:o,max:i,value:n,isIndeterminate:d,css:B,borderRadius:v,title:z,role:L}),a]})})});C.displayName="Progress";const Oe=X(function(t,e){const n=new J.Popup(t,e.overlayContainer);return K(n,e)},function(t,e,{position:n},o){x.useEffect(function(){const{instance:l}=t;function c(u){u.popup===l&&(l.update(),o(!0))}function a(u){u.popup===l&&o(!1)}return e.map.on({popupopen:c,popupclose:a}),e.overlayContainer==null?(n!=null&&l.setLatLng(n),l.openOn(e.map)):e.overlayContainer.bindPopup(l),function(){var d;e.map.off({popupopen:c,popupclose:a}),(d=e.overlayContainer)==null||d.unbindPopup(),e.map.removeLayer(l)}},[t,e,o,n])}),he=(s,t,e,n)=>{const i=(e-s)*Math.PI/180,l=(n-t)*Math.PI/180,c=Math.sin(i/2)*Math.sin(i/2)+Math.cos(s*Math.PI/180)*Math.cos(e*Math.PI/180)*Math.sin(l/2)*Math.sin(l/2);return 6371*(2*Math.atan2(Math.sqrt(c),Math.sqrt(1-c)))},fe=(s,t)=>{const e=Math.abs(t.getTime()-s.getTime());return Math.ceil(e/(1e3*60*60*24))},xe=(s,t)=>{const e=s.toLowerCase(),n=t.toLowerCase();if(e===n)return 1;if(e.includes(n)||n.includes(e))return .8;const o=new Set(e.split(" ")),i=new Set(n.split(" ")),l=new Set([...o].filter(a=>i.has(a))),c=new Set([...o,...i]);return l.size/c.size},be=(s,t)=>{const e=s.toLowerCase(),n=t.toLowerCase();if(e===n)return 1;if(e.includes(n)||n.includes(e))return .8;const o=new Set(e.split("-")),i=new Set(n.split("-")),l=new Set([...o].filter(a=>i.has(a))),c=new Set([...o,...i]);return l.size/c.size},ye=(s,t)=>{const e=xe(s.breed,t.breed),n=be(s.color,t.color),o=he(s.location.coordinates[1],s.location.coordinates[0],t.location.coordinates[1],t.location.coordinates[0]),i=Math.max(0,1-o/10),l=fe(new Date(s.lastSeen||""),new Date(t.foundDate||"")),c=Math.max(0,1-l/14),a={breed:.3,color:.3,location:.25,time:.15};return{score:e*a.breed+n*a.color+i*a.location+c*a.time,details:{breedScore:e,colorScore:n,locationScore:i,timeScore:c}}},Se=(s,t,e=.6)=>{const n=s.type==="lost"?"found":"lost";return t.filter(o=>o.type===n&&o.status==="active").map(o=>({dog:o,matchScore:ye(s.type==="lost"?s:o,s.type==="found"?s:o)})).filter(o=>o.matchScore.score>=e).sort((o,i)=>i.matchScore.score-o.matchScore.score)},p=({label:s,score:t})=>r.jsxs(P,{align:"stretch",spacing:1,children:[r.jsxs(b,{justify:"space-between",children:[r.jsx(y,{fontSize:"sm",color:"gray.600",children:s}),r.jsxs(y,{fontSize:"sm",fontWeight:"bold",children:[Math.round(t*100),"%"]})]}),r.jsx(C,{value:t*100,size:"sm",colorScheme:t>.7?"green":t>.4?"yellow":"red",borderRadius:"full"})]}),Re=({selectedDog:s,allDogs:t,onMatchSelect:e})=>{const{isOpen:n,onOpen:o,onClose:i}=F(),[l,c]=x.useState([]);return x.useEffect(()=>{if(s){const a=Se(s,t);c(a)}},[s,t]),!s||l.length===0?null:r.jsxs(r.Fragment,{children:[r.jsx(te,{position:"fixed",bottom:4,left:"50%",transform:"translateX(-50%)",colorScheme:"brand",size:"lg",onClick:o,zIndex:1e3,leftIcon:r.jsx(w,{colorScheme:"red",borderRadius:"full",fontSize:"sm",transform:"translateY(-1px)",children:l.length}),children:"พบสุนัขที่อาจจะตรงกัน"}),r.jsxs(Q,{isOpen:n,onClose:i,size:"6xl",children:[r.jsx(U,{}),r.jsxs(ee,{children:[r.jsxs(se,{children:["สุนัขที่อาจจะตรงกับ"," ",s.type==="lost"?"สุนัขหาย":"สุนัขที่พบ",":"," ",s.name||s.breed]}),r.jsx(Z,{}),r.jsx(D,{pb:6,children:r.jsx(M,{columns:{base:1,lg:2},spacing:6,children:l.map(({dog:a,matchScore:u})=>{var d;return r.jsx(Y,{borderWidth:1,borderRadius:"lg",overflow:"hidden",bg:"white",transition:"all 0.2s",cursor:"pointer",onClick:()=>{e(a),i()},_hover:{transform:"translateY(-2px)",shadow:"md"},children:r.jsxs(b,{spacing:4,p:4,children:[r.jsx(oe,{src:((d=a.photos)==null?void 0:d[0])||"/dog-placeholder.png",alt:a.breed,boxSize:"120px",objectFit:"cover",borderRadius:"md"}),r.jsxs(P,{align:"stretch",flex:1,children:[r.jsxs(b,{justify:"space-between",children:[r.jsxs(re,{size:"md",children:[a.type==="lost"?"สุนัขหาย":"พบสุนัข",":"," ",a.name||a.breed]}),r.jsxs(w,{colorScheme:u.score>.8?"green":u.score>.6?"yellow":"red",fontSize:"lg",px:2,py:1,borderRadius:"md",children:[Math.round(u.score*100),"% ตรงกัน"]})]}),r.jsx(y,{color:"gray.600",noOfLines:2,children:a.description}),r.jsxs(M,{columns:2,spacing:4,children:[r.jsx(p,{label:"พันธุ์",score:u.details.breedScore}),r.jsx(p,{label:"สี",score:u.details.colorScore}),r.jsx(p,{label:"ระยะทาง",score:u.details.locationScore}),r.jsx(p,{label:"เวลา",score:u.details.timeScore})]})]})]})},a._id)})})})]})]})]})};export{ne as M,Oe as P,k as a,Re as b};
