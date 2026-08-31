import { toPng } from 'html-to-image'
import { formatDate, formatTime, dayNames, scheduleDate, scheduleTime, weekdayIndex } from './constants'

export async function generateSchedulePNG(rows,locs,leaders,terrs){
 const validRows = rows || []
 const dates = validRows.map(scheduleDate).filter(Boolean).sort()
 const start = dates[0] || new Date().toISOString().slice(0,10)
 const end = dates[dates.length-1] || start
 const el=document.createElement('div')
 el.style.cssText='position:fixed;left:-10000px;top:0;width:760px;padding:64px;background:#fafafc;color:#171717;font-family:Inter,Arial,sans-serif'
 const cards=validRows.map(s=>{
   const wi=weekdayIndex(s)
   const date=scheduleDate(s)
   const day=wi!==null?dayNames[wi].toUpperCase():'SERVIÇO'
   return `<div style="background:white;border-radius:18px;padding:20px;margin:12px 0;box-shadow:0 8px 30px rgba(30,20,50,.06)"><div style="font-weight:800;color:#6d45a6">${day} · ${formatTime(scheduleTime(s))}</div><div style="color:#777;margin-top:4px">${date?formatDate(date):'Data a definir'}</div><div style="font-size:19px;font-weight:800;margin-top:8px">${locs.get(s.location_id)||'Local não definido'}</div><div style="margin-top:8px;color:#555">Dirigente: ${leaders.get(s.leader_id)||'Não definido'}<br>Território: ${terrs.get(s.territory_id)||'Não definido'}${s.road_name?`<br>Rua: ${s.road_name}`:''}${s.number_start!=null?`<br>Números: ${s.number_start}${s.number_end!=null?`–${s.number_end}`:''}`:''}</div></div>`
 }).join('')
 el.innerHTML=`<div style="font-size:15px;color:#6d45a6;font-weight:800;letter-spacing:2px">OESTE DE MARACANAÚ</div><h1 style="font-size:42px;margin:10px 0 6px">Serviço de Campo</h1><div style="color:#686773;margin-bottom:28px">Programação de ${formatDate(start)} a ${formatDate(end)}</div>${cards || '<div style="background:white;border-radius:18px;padding:24px">Nenhum serviço encontrado.</div>'}<div style="margin-top:30px;color:#8a8792;font-size:13px">Organize. Planeje. Pregue.</div>`
 document.body.appendChild(el)
 try { const data=await toPng(el,{pixelRatio:2}); const a=document.createElement('a');a.href=data;a.download='servico-de-campo.png';a.click() } finally { document.body.removeChild(el) }
}
