
const calculators = {
  area: {icon:"🏠", title:"평수 계산기", desc:"제곱미터(㎡)와 평을 양방향으로 변환합니다."},
  age: {icon:"🎂", title:"나이 계산기", desc:"생년월일을 기준으로 만 나이와 한국식 나이를 계산합니다."},
  date: {icon:"📅", title:"날짜 계산기", desc:"D-Day와 특정 날짜에서 며칠 전·후를 계산합니다."},
  exchange: {icon:"💱", title:"환율 계산기", desc:"최신 기준 환율로 주요 통화를 변환합니다."},
  unit: {icon:"📏", title:"단위 계산기", desc:"길이, 무게, 온도, 속도, 면적 단위를 변환합니다."},
  bmi: {icon:"⚖️", title:"BMI 계산기", desc:"키와 몸무게로 체질량지수(BMI)를 확인합니다."},
  salary: {icon:"💵", title:"연봉 계산기", desc:"월 예상 실수령액과 연봉 상승률을 간단히 계산합니다."},
  retirement: {icon:"💼", title:"퇴직금 계산기", desc:"근속기간과 평균임금으로 예상 퇴직금을 계산합니다."}
};
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const money = n => Math.round(n).toLocaleString("ko-KR") + "원";
const number = n => Number(n).toLocaleString("ko-KR", {maximumFractionDigits: 2});
const todayLocal = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};
function showView(id) {
  $$(".view").forEach(v=>v.classList.remove("active"));
  $("#"+id).classList.add("active");
  window.scrollTo({top:0, behavior:"smooth"});
}
function goHome() {
  history.replaceState(null, "", location.pathname);
  showView("home-view");
}
$$("[data-go-home]").forEach(b=>b.addEventListener("click", goHome));
$$("[data-open]").forEach(b=>b.addEventListener("click", ()=>openCalc(b.dataset.open)));
function shell(id, body) {
  const c = calculators[id];
  return `<div class="calc-head"><span class="icon">${c.icon}</span><h1>${c.title}</h1><p>${c.desc}</p></div>${body}`;
}
function showResult(id, html) {
  const el = $("#"+id);
  el.innerHTML = html;
  el.classList.add("show");
}
function openCalc(id) {
  if (!calculators[id]) return;
  history.replaceState(null, "", "#"+id);
  $("#calculator-content").innerHTML = renderers[id]();
  binders[id]();
  $("#related-list").innerHTML = Object.keys(calculators).filter(k=>k!==id).slice(0,4)
    .map(k=>`<button data-related="${k}">${calculators[k].icon} ${calculators[k].title}</button>`).join("");
  $$("[data-related]").forEach(b=>b.onclick=()=>openCalc(b.dataset.related));
  showView("calculator-view");
}
const renderers = {
 area: ()=>shell("area", `
  <div class="segmented"><button class="active" data-mode="sqm">㎡ → 평</button><button data-mode="pyeong">평 → ㎡</button></div>
  <div class="field"><label id="area-label">면적(㎡)</label><div class="input-wrap"><input id="area-value" type="number" inputmode="decimal" placeholder="예: 84"><em id="area-unit">㎡</em></div></div>
  <button class="primary-button" id="area-calc">계산하기</button><div class="result" id="area-result"></div>
  <p class="note">1평 = 약 3.305785㎡ 기준입니다. 아파트의 전용면적과 공급면적은 서로 다를 수 있습니다.</p>`),
 age: ()=>shell("age", `
  <div class="field"><label>생년월일</label><input id="birth" type="date"></div>
  <button class="primary-button" id="age-calc">나이 계산하기</button><div class="result" id="age-result"></div>
  <p class="note">한국의 법적·행정상 나이는 원칙적으로 만 나이를 사용합니다. 한국식 나이는 참고로 함께 보여드립니다.</p>`),
 date: ()=>shell("date", `
  <div class="segmented"><button class="active" data-date-mode="dday">D-Day</button><button data-date-mode="offset">날짜 더하기·빼기</button></div>
  <div id="dday-fields" class="form-grid two">
    <div class="field"><label>시작일</label><input id="date-start" type="date"></div>
    <div class="field"><label>목표일</label><input id="date-end" type="date"></div>
  </div>
  <div id="offset-fields" class="form-grid two" hidden>
    <div class="field"><label>기준일</label><input id="base-date" type="date"></div>
    <div class="field"><label>더하거나 뺄 일수</label><div class="input-wrap"><input id="offset-days" type="number" placeholder="예: 100 또는 -30"><em>일</em></div></div>
  </div>
  <button class="primary-button" id="date-calc">계산하기</button><div class="result" id="date-result"></div>`),
 exchange: ()=>shell("exchange", `
  <div class="inline-row">
    <div class="field"><label>금액</label><input id="fx-amount" type="number" inputmode="decimal" value="100000"></div>
    <button class="swap" id="fx-swap" aria-label="통화 바꾸기">⇄</button>
    <div></div>
  </div>
  <div class="form-grid two" style="margin-top:15px">
    <div class="field"><label>보내는 통화</label><select id="fx-from"></select></div>
    <div class="field"><label>받는 통화</label><select id="fx-to"></select></div>
  </div>
  <button class="primary-button" id="fx-calc">환율 계산하기</button><p class="status" id="fx-status">환율 정보를 불러오지 않았습니다.</p><div class="result" id="fx-result"></div>
  <p class="note">기준환율을 이용한 참고값이며, 은행·카드사 환전 수수료와 실제 적용 환율은 다를 수 있습니다.</p>`),
 unit: ()=>shell("unit", `
  <div class="field"><label>단위 종류</label><select id="unit-category"></select></div>
  <div class="inline-row" style="margin-top:15px">
    <div class="field"><label>값</label><input id="unit-value" type="number" inputmode="decimal" value="1"></div>
    <button class="swap" id="unit-swap" aria-label="단위 바꾸기">⇄</button><div></div>
  </div>
  <div class="form-grid two" style="margin-top:15px">
    <div class="field"><label>변환 전</label><select id="unit-from"></select></div>
    <div class="field"><label>변환 후</label><select id="unit-to"></select></div>
  </div>
  <button class="primary-button" id="unit-calc">변환하기</button><div class="result" id="unit-result"></div>`),
 bmi: ()=>shell("bmi", `
  <div class="form-grid two">
    <div class="field"><label>키</label><div class="input-wrap"><input id="height" type="number" inputmode="decimal" placeholder="예: 175"><em>cm</em></div></div>
    <div class="field"><label>몸무게</label><div class="input-wrap"><input id="weight" type="number" inputmode="decimal" placeholder="예: 75"><em>kg</em></div></div>
  </div>
  <button class="primary-button" id="bmi-calc">BMI 계산하기</button><div class="result" id="bmi-result"></div>
  <p class="note">BMI는 성인의 체중 상태를 간단히 살펴보는 지표이며 근육량, 체지방 분포, 질환 여부를 모두 반영하지는 못합니다.</p>`),
 salary: ()=>shell("salary", `
  <div class="segmented"><button class="active" data-salary-mode="takehome">월 실수령액</button><button data-salary-mode="raise">연봉 상승률</button></div>
  <div id="takehome-fields">
    <div class="field"><label>세전 연봉</label><div class="input-wrap"><input id="annual-salary" type="number" inputmode="numeric" placeholder="예: 50000000"><em>원</em></div></div>
  </div>
  <div id="raise-fields" class="form-grid two" hidden>
    <div class="field"><label>기존 연봉</label><div class="input-wrap"><input id="old-salary" type="number" placeholder="예: 50000000"><em>원</em></div></div>
    <div class="field"><label>변경 연봉</label><div class="input-wrap"><input id="new-salary" type="number" placeholder="예: 52500000"><em>원</em></div></div>
  </div>
  <button class="primary-button" id="salary-calc">계산하기</button><div class="result" id="salary-result"></div>
  <p class="note">실수령액은 비과세액, 부양가족, 보험료율, 소득세 공제 등에 따라 달라집니다. MVP에서는 일반적인 공제 수준을 적용한 예상치입니다.</p>`),
 retirement: ()=>shell("retirement", `
  <div class="form-grid two">
    <div class="field"><label>입사일</label><input id="join-date" type="date"></div>
    <div class="field"><label>퇴사 예정일</label><input id="leave-date" type="date"></div>
  </div>
  <div class="field" style="margin-top:15px"><label>최근 3개월 세전 임금 합계</label><div class="input-wrap"><input id="three-month-pay" type="number" placeholder="예: 15000000"><em>원</em></div></div>
  <button class="primary-button" id="retire-calc">예상 퇴직금 계산하기</button><div class="result" id="retire-result"></div>
  <p class="note">실제 퇴직금은 평균임금 산정에 포함되는 임금·상여금·연차수당, 근속기간 및 회사 규정에 따라 달라질 수 있습니다.</p>`)
};
const binders = {
 area() {
  let mode="sqm";
  $$("[data-mode]").forEach(b=>b.onclick=()=>{ $$("[data-mode]").forEach(x=>x.classList.remove("active")); b.classList.add("active"); mode=b.dataset.mode; $("#area-label").textContent=mode==="sqm"?"면적(㎡)":"면적(평)"; $("#area-unit").textContent=mode==="sqm"?"㎡":"평"; $("#area-result").classList.remove("show"); });
  $("#area-calc").onclick=()=>{ const v=parseFloat($("#area-value").value); if(!(v>=0)) return alert("면적을 입력해주세요."); const r=mode==="sqm"?v/3.305785:v*3.305785; showResult("area-result", `<span class="result-label">${number(v)}${mode==="sqm"?"㎡":"평"}은</span><strong class="big">${number(r)}${mode==="sqm"?"평":"㎡"}</strong>`); };
 },
 age() {
  $("#age-calc").onclick=()=>{ const s=$("#birth").value; if(!s) return alert("생년월일을 선택해주세요."); const b=new Date(s+"T00:00:00"), t=todayLocal(); if(b>t) return alert("미래 날짜는 선택할 수 없습니다."); let age=t.getFullYear()-b.getFullYear(); const before=(t.getMonth()<b.getMonth())||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()); if(before) age--; const korean=t.getFullYear()-b.getFullYear()+1; let next=new Date(t.getFullYear(), b.getMonth(), b.getDate()); if(next<t) next=new Date(t.getFullYear()+1,b.getMonth(),b.getDate()); const days=Math.ceil((next-t)/86400000); showResult("age-result", `<span class="result-label">현재 나이</span><strong class="big">만 ${age}세</strong><div class="result-grid"><div class="result-item"><small>한국식 나이</small><strong>${korean}세</strong></div><div class="result-item"><small>다음 생일까지</small><strong>${days===0?"오늘":days+"일"}</strong></div></div>`); };
 },
 date() {
  let mode="dday"; const iso=d=>d.toISOString().slice(0,10); $("#date-start").value=iso(new Date()); $("#base-date").value=iso(new Date());
  $$("[data-date-mode]").forEach(b=>b.onclick=()=>{ $$("[data-date-mode]").forEach(x=>x.classList.remove("active")); b.classList.add("active"); mode=b.dataset.dateMode; $("#dday-fields").hidden=mode!=="dday"; $("#offset-fields").hidden=mode==="dday"; $("#date-result").classList.remove("show"); });
  $("#date-calc").onclick=()=>{ if(mode==="dday"){ const a=$("#date-start").value,b=$("#date-end").value;if(!a||!b)return alert("두 날짜를 모두 선택해주세요.");const diff=Math.round((new Date(b+"T00:00:00")-new Date(a+"T00:00:00"))/86400000);showResult("date-result",`<span class="result-label">두 날짜의 차이</span><strong class="big">${diff===0?"D-Day":diff>0?"D-"+diff:"D+"+Math.abs(diff)}</strong><p>${Math.abs(diff).toLocaleString()}일 차이입니다.</p>`);} else {const b=$("#base-date").value,n=parseInt($("#offset-days").value);if(!b||Number.isNaN(n))return alert("기준일과 일수를 입력해주세요.");const d=new Date(b+"T00:00:00");d.setDate(d.getDate()+n);showResult("date-result",`<span class="result-label">${b}에서 ${n>=0?n+"일 후":Math.abs(n)+"일 전"}</span><strong class="big">${d.toLocaleDateString("ko-KR")}</strong>`);} };
 },
 exchange() {
  const curr={KRW:"대한민국 원 (KRW)",USD:"미국 달러 (USD)",JPY:"일본 엔 (JPY)",EUR:"유로 (EUR)",CNY:"중국 위안 (CNY)",GBP:"영국 파운드 (GBP)",AUD:"호주 달러 (AUD)",CAD:"캐나다 달러 (CAD)",THB:"태국 바트 (THB)",VND:"베트남 동 (VND)"};
  const opts=Object.entries(curr).map(([v,t])=>`<option value="${v}">${t}</option>`).join(""); $("#fx-from").innerHTML=opts;$("#fx-to").innerHTML=opts;$("#fx-from").value="JPY";$("#fx-to").value="KRW";
  $("#fx-swap").onclick=()=>{const a=$("#fx-from").value;$("#fx-from").value=$("#fx-to").value;$("#fx-to").value=a;};
  $("#fx-calc").onclick=async()=>{const amount=parseFloat($("#fx-amount").value),from=$("#fx-from").value,to=$("#fx-to").value;if(!(amount>=0))return alert("금액을 입력해주세요.");if(from===to)return showResult("fx-result",`<strong class="big">${number(amount)} ${to}</strong>`);$("#fx-status").textContent="최신 환율을 불러오는 중입니다…";try{const res=await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);if(!res.ok)throw new Error();const data=await res.json();const rate=data.rates[to],converted=amount*rate;$("#fx-status").textContent=`기준일 ${data.date} · 1 ${from} = ${number(rate)} ${to}`;showResult("fx-result",`<span class="result-label">${number(amount)} ${from}</span><strong class="big">${number(converted)} ${to}</strong>`);}catch(e){$("#fx-status").textContent="환율 정보를 불러오지 못했습니다.";alert("인터넷 연결 후 다시 시도해주세요.");}};
 },
 unit() {
  const data={
   "길이":{m:["미터(m)",1],cm:["센티미터(cm)",.01],mm:["밀리미터(mm)",.001],km:["킬로미터(km)",1000],inch:["인치(in)",.0254],ft:["피트(ft)",.3048],yd:["야드(yd)",.9144],mile:["마일(mi)",1609.344]},
   "무게":{kg:["킬로그램(kg)",1],g:["그램(g)",.001],lb:["파운드(lb)",.45359237],oz:["온스(oz)",.028349523125]},
   "속도":{kph:["km/h",1],mph:["mph",1.609344],mps:["m/s",3.6],knot:["노트(kn)",1.852]},
   "면적":{sqm:["제곱미터(㎡)",1],pyeong:["평",3.305785],sqft:["제곱피트(ft²)",.09290304],acre:["에이커(ac)",4046.8564224],ha:["헥타르(ha)",10000]},
   "온도":{C:["섭씨(℃)",null],F:["화씨(℉)",null],K:["켈빈(K)",null]}
  };
  $("#unit-category").innerHTML=Object.keys(data).map(x=>`<option>${x}</option>`).join("");
  function fill(){const cat=$("#unit-category").value,opts=Object.entries(data[cat]).map(([v,[t]])=>`<option value="${v}">${t}</option>`).join("");$("#unit-from").innerHTML=opts;$("#unit-to").innerHTML=opts;$("#unit-to").selectedIndex=1;}
  fill();$("#unit-category").onchange=fill;$("#unit-swap").onclick=()=>{const a=$("#unit-from").value;$("#unit-from").value=$("#unit-to").value;$("#unit-to").value=a;};
  $("#unit-calc").onclick=()=>{const v=parseFloat($("#unit-value").value),cat=$("#unit-category").value,from=$("#unit-from").value,to=$("#unit-to").value;if(Number.isNaN(v))return alert("값을 입력해주세요.");let r;if(cat==="온도"){let c=from==="C"?v:from==="F"?(v-32)*5/9:v-273.15;r=to==="C"?c:to==="F"?c*9/5+32:c+273.15;}else r=v*data[cat][from][1]/data[cat][to][1];showResult("unit-result",`<span class="result-label">${number(v)} ${data[cat][from][0]}</span><strong class="big">${number(r)} ${data[cat][to][0]}</strong>`);};
 },
 bmi() {
  $("#bmi-calc").onclick=()=>{const h=parseFloat($("#height").value),w=parseFloat($("#weight").value);if(!(h>0&&w>0))return alert("키와 몸무게를 입력해주세요.");const bmi=w/((h/100)**2);let cls,guide;if(bmi<18.5){cls="저체중";guide=["규칙적인 식사와 충분한 단백질 섭취를 살펴보세요.","원치 않는 체중 감소가 이어지면 의료진과 상담해보세요."];}else if(bmi<23){cls="정상 범위";guide=["현재 생활습관을 꾸준히 유지해보세요.","주 150분 정도의 중강도 신체활동을 목표로 해보세요."];}else if(bmi<25){cls="과체중 전단계";guide=["음료·간식의 당류와 야식 빈도를 먼저 점검해보세요.","걷기와 근력운동을 무리 없이 꾸준히 시작해보세요."];}else if(bmi<30){cls="1단계 비만";guide=["체중의 5~10% 감량도 건강상 이점이 있을 수 있습니다.","식사·운동 계획이 어렵다면 보건소나 의료진의 체중관리 상담을 고려해보세요."];}else{cls="2단계 이상 비만";guide=["무리한 단기 감량보다 의료진과 안전한 관리계획을 세우는 것이 좋습니다.","약물치료 여부는 BMI뿐 아니라 동반질환과 건강상태를 함께 평가해 결정합니다."];}showResult("bmi-result",`<span class="result-label">체질량지수</span><strong class="big">${bmi.toFixed(1)} · ${cls}</strong><div class="health-guide"><h3>생활관리 안내</h3><ul>${guide.map(x=>`<li>${x}</li>`).join("")}</ul></div>`);};
 },
 salary() {
  let mode="takehome";$$("[data-salary-mode]").forEach(b=>b.onclick=()=>{$$("[data-salary-mode]").forEach(x=>x.classList.remove("active"));b.classList.add("active");mode=b.dataset.salaryMode;$("#takehome-fields").hidden=mode!=="takehome";$("#raise-fields").hidden=mode==="takehome";$("#salary-result").classList.remove("show");});
  $("#salary-calc").onclick=()=>{if(mode==="takehome"){const a=parseFloat($("#annual-salary").value);if(!(a>0))return alert("연봉을 입력해주세요.");const monthly=a/12;let rate=a<=30000000?.085:a<=50000000?.105:a<=70000000?.125:a<=100000000?.15:.18;const net=monthly*(1-rate);showResult("salary-result",`<span class="result-label">예상 월 실수령액</span><strong class="big">${money(net)}</strong><div class="result-grid"><div class="result-item"><small>월 세전</small><strong>${money(monthly)}</strong></div><div class="result-item"><small>예상 공제</small><strong>${money(monthly-net)}</strong></div></div>`);}else{const o=parseFloat($("#old-salary").value),n=parseFloat($("#new-salary").value);if(!(o>0&&n>0))return alert("기존 연봉과 변경 연봉을 입력해주세요.");const diff=n-o,rate=diff/o*100;showResult("salary-result",`<span class="result-label">연봉 변화율</span><strong class="big">${rate>=0?"+":""}${rate.toFixed(2)}%</strong><div class="result-grid"><div class="result-item"><small>연간 증감액</small><strong>${rate>=0?"+":""}${money(diff)}</strong></div><div class="result-item"><small>월 세전 증감</small><strong>${rate>=0?"+":""}${money(diff/12)}</strong></div></div>`);}};
 },
 retirement() {
  $("#retire-calc").onclick=()=>{const j=$("#join-date").value,l=$("#leave-date").value,p=parseFloat($("#three-month-pay").value);if(!j||!l||!(p>0))return alert("입사일, 퇴사일, 최근 3개월 임금을 입력해주세요.");const start=new Date(j+"T00:00:00"),end=new Date(l+"T00:00:00");const days=Math.floor((end-start)/86400000)+1;if(days<365)return alert("근속기간이 1년 미만입니다. 일반적인 법정 퇴직금 대상 여부를 별도로 확인해주세요.");const avgDaily=p/90;const result=avgDaily*30*(days/365);showResult("retire-result",`<span class="result-label">예상 퇴직금</span><strong class="big">${money(result)}</strong><div class="result-grid"><div class="result-item"><small>근속일수</small><strong>${days.toLocaleString()}일</strong></div><div class="result-item"><small>1일 평균임금(간이)</small><strong>${money(avgDaily)}</strong></div></div>`);};
 }
};
const info = {
 privacy:`<h1>개인정보처리방침</h1><p>계산집은 계산기에 입력한 값을 별도 서버로 수집하거나 저장하지 않습니다.</p><h2>접속 정보</h2><p>서비스 품질 개선 및 광고 운영 과정에서 호스팅 서비스, 분석 도구 또는 광고 사업자가 쿠키와 접속 정보를 처리할 수 있습니다. 실제 도구를 연결할 때 본 방침을 구체적으로 갱신해야 합니다.</p><h2>문의</h2><p>운영자 이메일을 확정한 뒤 이곳에 기재하세요.</p>`,
 terms:`<h1>이용약관</h1><p>계산집의 모든 계산 결과는 일반적인 기준에 따른 참고용 정보입니다. 실제 세금, 임금, 퇴직금, 건강상태 및 환율과 차이가 날 수 있습니다.</p><h2>책임의 제한</h2><p>중요한 금융·노무·건강 관련 결정을 내리기 전에는 관계 기관 또는 전문가의 확인을 권합니다.</p>`,
 contact:`<h1>문의</h1><p>서비스 오류, 개선 의견, 제휴 문의를 받을 운영자 이메일을 확정한 뒤 이곳에 기재하세요.</p><p><strong>예시:</strong> contact@your-domain.com</p>`
};
$$("[data-info]").forEach(b=>b.onclick=()=>{$("#info-content").innerHTML=info[b.dataset.info];showView("info-view");});
window.addEventListener("hashchange",()=>{const id=location.hash.slice(1);if(calculators[id])openCalc(id);});
if(calculators[location.hash.slice(1)]) openCalc(location.hash.slice(1));
