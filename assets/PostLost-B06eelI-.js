import{r as f,p as E,s as L,n as R,j as e,B as g,d as q}from"./index-DaKMN1yZ.js";import{L as T}from"./LocationPicker-BzlHDbK3.js";import{C as D}from"./chunk-5MKCW436-Crl8gLHr.js";import{V as w}from"./index-DCkPA7ii.js";import{H as P}from"./chunk-7OLJDQMT-BqdKiONh.js";import{T as S,S as k,B as z}from"./chunk-ZHMYA64R-DpJu8I27.js";import{F as s,I as d}from"./chunk-6CVSDS6C-BbEwV9Gm.js";import{F as a}from"./chunk-H46NUPBZ-DTsN5Duz.js";import{F as l}from"./chunk-VGESXGVT-DsD-yEVV.js";import{T as A}from"./chunk-4IH3O7BJ-BRPz7fCs.js";import"./leaflet-C4RW84Ki.js";import"./iconBase-_M4XJSaB.js";const B={name:"",breed:"",color:"",location:null,description:"",contact:"",photos:null,lastSeen:new Date().toISOString().split("T")[0]},X=()=>{const[t,p]=f.useState(B),[r,m]=f.useState({}),[b,j]=f.useState(!1),u=E(),v=L(),{user:i}=R(),I=()=>{const n={};return t.name||(n.name="กรุณาระบุชื่อสุนัข"),t.breed||(n.breed="กรุณาระบุพันธุ์สุนัข"),t.color||(n.color="กรุณาระบุสีสุนัข"),t.location||(n.location="กรุณาระบุตำแหน่งที่พบ"),t.description||(n.description="กรุณาระบุรายละเอียด"),!t.contact&&!i&&(n.contact="กรุณาระบุข้อมูลการติดต่อ"),t.lastSeen||(n.lastSeen="กรุณาระบุวันที่พบสุนัขล่าสุด"),m(n),Object.keys(n).length===0},C=async n=>{if(n.preventDefault(),!I()){u({title:"Form Error",description:"Please fill in all required fields.",status:"error",duration:5e3,isClosable:!0});return}j(!0);try{const o=new FormData;o.append("type","lost"),o.append("name",t.name),o.append("breed",t.breed),o.append("color",t.color),o.append("description",t.description),o.append("lastSeen",t.lastSeen),t.location&&(o.append("location",JSON.stringify({type:"Point",coordinates:[t.location.coordinates[1],t.location.coordinates[0]]})),o.append("locationName",t.location.name)),t.photos&&Array.from(t.photos).forEach(h=>{o.append("photos",h)}),i?(o.append("userId",i.id),o.append("userContact",i.email||""),i.contactInfo&&o.append("userContactInfo",i.contactInfo)):t.contact&&o.append("contact",t.contact),await q.createDog(o),u({title:"Report submitted",description:"Your lost dog report has been submitted successfully.",status:"success",duration:5e3,isClosable:!0}),v("/map")}catch(o){console.error("Error submitting report:",o),u({title:"Error",description:"Failed to submit report. Please try again.",status:"error",duration:5e3,isClosable:!0})}finally{j(!1)}},c=n=>{const{name:o,value:h}=n.target;p(x=>({...x,[o]:h})),r[o]&&m(x=>({...x,[o]:""}))},y=n=>{n.target.files&&p(o=>({...o,photos:n.target.files}))},F=n=>{p(o=>({...o,location:n})),r.location&&m(o=>({...o,location:""}))};return e.jsx(D,{maxW:"container.md",py:8,children:e.jsxs(w,{spacing:8,align:"stretch",children:[e.jsxs(g,{textAlign:"center",children:[e.jsx(P,{size:"xl",color:"orange.600",mb:2,children:"แจ้งสุนัขหาย"}),e.jsx(S,{color:"gray.600",fontSize:"lg",children:"กรอกข้อมูลสุนัขที่หายเพื่อให้ผู้อื่นช่วยตามหา"})]}),e.jsx(g,{as:"form",onSubmit:C,children:e.jsxs(k,{spacing:6,children:[e.jsxs(s,{isRequired:!0,isInvalid:!!r.name,children:[e.jsx(a,{children:"ชื่อสุนัข"}),e.jsx(d,{name:"name",value:t.name,onChange:c,placeholder:"ระบุชื่อสุนัข"}),e.jsx(l,{children:r.name})]}),e.jsxs(s,{isRequired:!0,isInvalid:!!r.breed,children:[e.jsx(a,{children:"พันธุ์สุนัข"}),e.jsx(d,{name:"breed",value:t.breed,onChange:c,placeholder:"ระบุพันธุ์สุนัข เช่น ไทยหลังอาน, ชิวาวา, โกลเด้น"}),e.jsx(l,{children:r.breed})]}),e.jsxs(s,{isRequired:!0,isInvalid:!!r.color,children:[e.jsx(a,{children:"สี"}),e.jsx(d,{name:"color",value:t.color,onChange:c,placeholder:"ระบุสีขน เช่น น้ำตาล-ขาว, ดำ"}),e.jsx(l,{children:r.color})]}),e.jsxs(s,{isRequired:!0,isInvalid:!!r.location,children:[e.jsx(a,{children:"สถานที่พบครั้งสุดท้าย"}),e.jsx(T,{onLocationSelect:F,defaultLocation:t.location||void 0}),e.jsx(l,{children:r.location})]}),e.jsxs(s,{isRequired:!0,isInvalid:!!r.lastSeen,children:[e.jsx(a,{children:"วันที่พบเห็นล่าสุด"}),e.jsx(d,{type:"date",name:"lastSeen",value:t.lastSeen,onChange:c,max:new Date().toISOString().split("T")[0]}),e.jsx(l,{children:r.lastSeen})]}),e.jsxs(s,{isRequired:!0,isInvalid:!!r.description,children:[e.jsx(a,{children:"รายละเอียดเพิ่มเติม"}),e.jsx(A,{name:"description",value:t.description,onChange:c,placeholder:"ระบุรายละเอียดเพิ่มเติม เช่น ลักษณะพิเศษ ใส่ปลอกคอสีอะไร มีโรคประจำตัวหรือไม่",rows:4}),e.jsx(l,{children:r.description})]}),!i&&e.jsxs(s,{isRequired:!0,isInvalid:!!r.contact,children:[e.jsx(a,{children:"ข้อมูลการติดต่อ"}),e.jsx(d,{name:"contact",value:t.contact,onChange:c,placeholder:"ระบุเบอร์โทร, LINE ID หรือช่องทางติดต่ออื่นๆ"}),e.jsx(l,{children:r.contact})]}),e.jsxs(s,{children:[e.jsx(a,{children:"รูปภาพ"}),e.jsx(S,{fontSize:"sm",color:"gray.600",mb:2,children:"แนะนำให้อัพโหลดรูปที่เห็นตัวสุนัขชัดเจน หลายๆ มุม"}),e.jsx(d,{type:"file",name:"photos",accept:"image/*",multiple:!0,onChange:y})]}),e.jsx(z,{type:"submit",colorScheme:"red",size:"lg",isLoading:b,loadingText:"กำลังส่งข้อมูล...",children:"แจ้งสุนัขหาย"})]})})]})})};export{X as default};
