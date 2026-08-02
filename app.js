
const calculators = {
  area: {icon:"🏠", title:"평형 계산기", desc:"전용면적과 예전식 공급면적 기준 평형을 함께 확인합니다."},
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
const digits = value => String(value ?? "").replace(/[^\d]/g, "");
const parseMoney = value => Number(digits(value)) || 0;
const formatMoneyInput = input => {
  const caretAtEnd = input.selectionStart === input.value.length;
  const n = digits(input.value);
  input.value = n ? Number(n).toLocaleString("ko-KR") : "";
  if (caretAtEnd) input.setSelectionRange(input.value.length, input.value.length);
};
const bindMoneyInputs = (root=document) => {
  $$("[data-money]", root).forEach(input => {
    input.addEventListener("input", () => formatMoneyInput(input));
    input.addEventListener("focus", () => setTimeout(()=>input.select(), 0));
  });
};
function dateParts(prefix, label, value="") {
  const d = value ? new Date(value+"T00:00:00") : null;
  const y = d && !isNaN(d) ? d.getFullYear() : "";
  const m = d && !isNaN(d) ? d.getMonth()+1 : "";
  const day = d && !isNaN(d) ? d.getDate() : "";
  return `<div class="field date-field"><label>${label}</label><div class="date-parts">
    <input id="${prefix}-y" type="text" inputmode="numeric" maxlength="4" placeholder="YYYY" value="${y}">
    <span>년</span>
    <input id="${prefix}-m" type="text" inputmode="numeric" maxlength="2" placeholder="MM" value="${m}">
    <span>월</span>
    <input id="${prefix}-d" type="text" inputmode="numeric" maxlength="2" placeholder="DD" value="${day}">
    <span>일</span>
  </div></div>`;
}
function bindDateParts(prefix) {
  const y=$("#"+prefix+"-y"), m=$("#"+prefix+"-m"), d=$("#"+prefix+"-d");
  [y,m,d].forEach(el=>el.addEventListener("input",()=>{
    el.value=digits(el.value).slice(0, el.maxLength);
    if(el===y && el.value.length===4) m.focus();
    if(el===m && el.value.length===2) d.focus();
  }));
}
function getDateParts(prefix) {
  const y=Number($("#"+prefix+"-y").value), m=Number($("#"+prefix+"-m").value), d=Number($("#"+prefix+"-d").value);
  if(!y || m<1 || m>12 || d<1 || d>31) return null;
  const date=new Date(y,m-1,d);
  return date.getFullYear()===y && date.getMonth()===m-1 && date.getDate()===d ? date : null;
}
function dateText(date){ return `${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일`; }

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
  bindMoneyInputs($("#calculator-content"));
  $("#related-list").innerHTML = Object.keys(calculators).filter(k=>k!==id).slice(0,4)
    .map(k=>`<button data-related="${k}">${calculators[k].icon} ${calculators[k].title}</button>`).join("");
  $$("[data-related]").forEach(b=>b.onclick=()=>openCalc(b.dataset.related));
  showView("calculator-view");
}
const renderers = {
 area: ()=>shell("area", `
  <div class="segmented"><button class="active" data-mode="sqm">전용면적 ㎡ 입력</button><button data-mode="pyeong">전용평수 입력</button></div>
  <div class="quick-picks" aria-label="자주 찾는 전용면적">
    <button type="button" data-area-pick="59">59㎡</button>
    <button type="button" data-area-pick="74">74㎡</button>
    <button type="button" data-area-pick="84">84㎡</button>
    <button type="button" data-area-pick="101">101㎡</button>
  </div>
  <div class="field"><label id="area-label">전용면적</label><div class="input-wrap"><input id="area-value" type="number" inputmode="decimal" placeholder="예: 84"><em id="area-unit">㎡</em></div></div>
  <div class="field" style="margin-top:15px">
    <label>공급면적 계산 방식</label>
    <select id="exclusive-rate">
      <option value="range">일반적인 범위로 보기</option>
      <option value="80">전용률 80%</option>
      <option value="78">전용률 78%</option>
      <option value="75">전용률 75%</option>
      <option value="custom">전용률 직접 입력</option>
    </select>
  </div>
  <div class="field" id="custom-rate-field" style="margin-top:15px" hidden>
    <label>전용률 직접 입력</label>
    <div class="input-wrap"><input id="custom-rate" type="number" inputmode="decimal" placeholder="예: 78"><em>%</em></div>
  </div>
  <button class="primary-button" id="area-calc">평형 계산하기</button>
  <div class="result" id="area-result"></div>
  <p class="note">전용면적의 평수는 정확한 단위 변환값입니다. 공급면적 기준 평형은 주거공용면적을 포함하므로 단지와 주택형별 전용률에 따라 달라집니다.</p>`),
 age: ()=>shell("age", `
  ${dateParts("birth","생년월일")}
  <button class="primary-button" id="age-calc">나이 계산하기</button><div class="result" id="age-result"></div>
  <p class="note">연도 네 자리를 입력하면 월 입력칸으로, 월 두 자리를 입력하면 일 입력칸으로 자동 이동합니다. 법적·행정상 나이는 원칙적으로 만 나이를 사용합니다.</p>`),
 date: ()=>shell("date", `
  <div class="segmented"><button class="active" data-date-mode="dday">D-Day · 기념일</button><button data-date-mode="offset">날짜 더하기·빼기</button></div>
  <div id="dday-fields" class="form-grid">
    ${dateParts("date-start","시작일")}
    ${dateParts("date-end","목표일")}
    <div class="field"><label>기념일 이름 <span class="optional">(선택)</span></label><input id="anniversary-name" type="text" placeholder="예: 결혼기념일, 만난 날"></div>
  </div>
  <div id="offset-fields" class="form-grid" hidden>
    ${dateParts("base-date","기준일")}
    <div class="field"><label>더하거나 뺄 일수</label><div class="input-wrap"><input id="offset-days" type="number" placeholder="예: 100 또는 -30"><em>일</em></div></div>
  </div>
  <button class="primary-button" id="date-calc">계산하기</button><div class="result" id="date-result"></div>
  <p class="note">기념일 계산은 시작일과 목표일을 기준으로 지난 기간, 몇 주년인지, 다음 주년까지 남은 날짜를 함께 보여줍니다.</p>`),
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
  <div class="unit-live" style="margin-top:15px">
    <div class="unit-side">
      <label>변환할 값</label>
      <input id="unit-value" type="number" inputmode="decimal" value="1">
      <select id="unit-from"></select>
    </div>
    <button class="swap unit-center" id="unit-swap" aria-label="단위 바꾸기">⇄</button>
    <div class="unit-side unit-output">
      <label>변환 결과</label>
      <output id="unit-live-result">-</output>
      <select id="unit-to"></select>
    </div>
  </div>
  <p class="note">값이나 단위를 바꾸면 계산 버튼 없이 결과가 바로 갱신됩니다.</p>`),
 bmi: ()=>shell("bmi", `
  <div class="form-grid two">
    <div class="field"><label>키</label><div class="input-wrap"><input id="height" type="number" inputmode="decimal" placeholder="예: 175"><em>cm</em></div></div>
    <div class="field"><label>몸무게</label><div class="input-wrap"><input id="weight" type="number" inputmode="decimal" placeholder="예: 75"><em>kg</em></div></div>
  </div>
  <button class="primary-button" id="bmi-calc">BMI 계산하기</button><div class="result" id="bmi-result"></div>
  <p class="note">BMI는 성인의 체중 상태를 간단히 살펴보는 지표이며 근육량, 체지방 분포, 질환 여부를 모두 반영하지는 못합니다.</p>`),
 salary: ()=>shell("salary", `
  <div class="segmented"><button class="active" data-salary-mode="takehome">월 실수령액</button><button data-salary-mode="raise">연봉 상승 계산</button></div>

  <div id="takehome-fields">
    <div class="field"><label>세전 연봉</label><div class="input-wrap"><input id="annual-salary" type="text" inputmode="numeric" data-money placeholder="예: 50,000,000"><em>원</em></div></div>
  </div>

  <div id="raise-fields" hidden>
    <div class="segmented sub-segmented">
      <button class="active" data-raise-mode="newSalary">변경 연봉으로 계산</button>
      <button data-raise-mode="rate">상승률로 계산</button>
    </div>

    <div class="field">
      <label>기존 연봉</label>
      <div class="input-wrap"><input id="old-salary" type="text" inputmode="numeric" data-money placeholder="예: 50,000,000"><em>원</em></div>
    </div>

    <div id="raise-by-new" class="field" style="margin-top:15px">
      <label>변경 연봉</label>
      <div class="input-wrap"><input id="new-salary" type="text" inputmode="numeric" data-money placeholder="예: 52,500,000"><em>원</em></div>
    </div>

    <div id="raise-by-rate" class="field" style="margin-top:15px" hidden>
      <label>연봉 상승률</label>
      <div class="input-wrap"><input id="raise-rate" type="number" inputmode="decimal" placeholder="예: 5"><em>%</em></div>
    </div>
  </div>

  <button class="primary-button" id="salary-calc">계산하기</button>
  <div class="result" id="salary-result"></div>
  <p class="note">월 실수령액은 세전 연봉만 입력하면 됩니다. 연봉 상승 계산에서는 기존 연봉과 변경 연봉 또는 상승률 중 하나를 입력해 결과를 확인할 수 있습니다.</p>`),
 retirement: ()=>shell("retirement", `
  <div class="form-grid">
    ${dateParts("join-date","입사일")}
    ${dateParts("leave-date","퇴사 예정일")}
  </div>
  <div class="field" style="margin-top:15px"><label>최근 3개월 세전 임금 합계</label><div class="input-wrap"><input id="three-month-pay" type="text" inputmode="numeric" data-money placeholder="예: 15000000"><em>원</em></div></div>
  <button class="primary-button" id="retire-calc">예상 퇴직금 계산하기</button><div class="result" id="retire-result"></div>
  <p class="note">실제 퇴직금은 평균임금 산정에 포함되는 임금·상여금·연차수당, 근속기간 및 회사 규정에 따라 달라질 수 있습니다.</p>`)
};
const binders = {
 area() {
  let mode="sqm";
  const input=$("#area-value");
  const rateSelect=$("#exclusive-rate");
  const customField=$("#custom-rate-field");

  function updateMode(nextMode){
    mode=nextMode;
    $$("[data-mode]").forEach(x=>x.classList.toggle("active", x.dataset.mode===mode));
    $("#area-label").textContent=mode==="sqm"?"전용면적":"전용평수";
    $("#area-unit").textContent=mode==="sqm"?"㎡":"평";
    input.placeholder=mode==="sqm"?"예: 84":"예: 25.4";
    $("#area-result").classList.remove("show");
  }

  $$("[data-mode]").forEach(b=>b.onclick=()=>updateMode(b.dataset.mode));
  $$("[data-area-pick]").forEach(b=>b.onclick=()=>{
    updateMode("sqm");
    input.value=b.dataset.areaPick;
    $("#area-calc").click();
  });

  rateSelect.onchange=()=>{
    customField.hidden=rateSelect.value!=="custom";
    $("#area-result").classList.remove("show");
  };

  $("#area-calc").onclick=()=>{
    const raw=parseFloat(input.value);
    if(!(raw>0)) return alert("전용면적 또는 전용평수를 입력해주세요.");

    const exclusiveSqm=mode==="sqm"?raw:raw*3.305785;
    const exclusivePyeong=exclusiveSqm/3.305785;

    let supplyHtml="";
    if(rateSelect.value==="range"){
      const lowRate=0.80, highRate=0.75;
      const supplyLowSqm=exclusiveSqm/lowRate;
      const supplyHighSqm=exclusiveSqm/highRate;
      const supplyLowP=supplyLowSqm/3.305785;
      const supplyHighP=supplyHighSqm/3.305785;
      supplyHtml=`
        <div class="supply-highlight">
          <small>예전식 공급면적 기준 예상 평형</small>
          <strong>약 ${number(supplyLowP)}~${number(supplyHighP)}평형</strong>
          <span>예상 공급면적 ${number(supplyLowSqm)}~${number(supplyHighSqm)}㎡</span>
        </div>`;
    }else{
      let rate=rateSelect.value==="custom"?parseFloat($("#custom-rate").value):parseFloat(rateSelect.value);
      if(!(rate>0&&rate<100)) return alert("전용률을 1~99 사이로 입력해주세요.");
      const supplySqm=exclusiveSqm/(rate/100);
      const supplyP=supplySqm/3.305785;
      supplyHtml=`
        <div class="supply-highlight">
          <small>전용률 ${number(rate)}% 적용 공급면적 기준</small>
          <strong>약 ${number(supplyP)}평형</strong>
          <span>예상 공급면적 ${number(supplySqm)}㎡</span>
        </div>`;
    }

    showResult("area-result", `
      <span class="result-label">전용면적 기준</span>
      <strong class="big">${number(exclusivePyeong)}평</strong>
      <div class="result-grid">
        <div class="result-item"><small>전용면적</small><strong>${number(exclusiveSqm)}㎡</strong></div>
        <div class="result-item"><small>정확한 전용평수</small><strong>${number(exclusivePyeong)}평</strong></div>
      </div>
      ${supplyHtml}
      <div class="area-explain">
        <strong>왜 두 평수가 다른가요?</strong>
        <p>전용평수는 실제 세대 내부 면적만 환산한 값입니다. 흔히 “34평 아파트”라고 부르는 평형은 복도·계단·엘리베이터홀 등 주거공용면적이 포함된 공급면적 기준입니다.</p>
      </div>
    `);
  };
 },
 age() {
  bindDateParts("birth");
  $("#age-calc").onclick=()=>{
    const b=getDateParts("birth"), t=todayLocal();
    if(!b) return alert("올바른 생년월일을 입력해주세요.");
    if(b>t) return alert("미래 날짜는 입력할 수 없습니다.");
    let age=t.getFullYear()-b.getFullYear();
    const before=(t.getMonth()<b.getMonth())||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate());
    if(before) age--;
    const korean=t.getFullYear()-b.getFullYear()+1;
    const yearAge=t.getFullYear()-b.getFullYear();
    let next=new Date(t.getFullYear(), b.getMonth(), b.getDate());
    if(next<t) next=new Date(t.getFullYear()+1,b.getMonth(),b.getDate());
    const days=Math.ceil((next-t)/86400000);
    const lived=Math.floor((t-b)/86400000);
    showResult("age-result", `<span class="result-label">현재 나이</span><strong class="big">만 ${age}세</strong>
      <div class="result-grid"><div class="result-item"><small>한국식 나이</small><strong>${korean}세</strong></div>
      <div class="result-item"><small>연 나이</small><strong>${yearAge}세</strong></div>
      <div class="result-item"><small>다음 생일까지</small><strong>${days===0?"오늘":days+"일"}</strong></div>
      <div class="result-item"><small>태어난 뒤 지난 날</small><strong>${lived.toLocaleString()}일</strong></div></div>`);
  };
 },
 date() {
  let mode="dday";
  ["date-start","date-end","base-date"].forEach(bindDateParts);
  const now=todayLocal();
  $("#date-start-y").value=now.getFullYear(); $("#date-start-m").value=now.getMonth()+1; $("#date-start-d").value=now.getDate();
  $("#base-date-y").value=now.getFullYear(); $("#base-date-m").value=now.getMonth()+1; $("#base-date-d").value=now.getDate();
  $$("[data-date-mode]").forEach(b=>b.onclick=()=>{
    $$("[data-date-mode]").forEach(x=>x.classList.remove("active")); b.classList.add("active");
    mode=b.dataset.dateMode; $("#dday-fields").hidden=mode!=="dday"; $("#offset-fields").hidden=mode==="dday"; $("#date-result").classList.remove("show");
  });
  $("#date-calc").onclick=()=>{
    if(mode==="dday"){
      const a=getDateParts("date-start"), b=getDateParts("date-end");
      if(!a||!b) return alert("시작일과 목표일을 올바르게 입력해주세요.");
      const diff=Math.round((b-a)/86400000);
      const name=$("#anniversary-name").value.trim() || "기념일";
      let years=b.getFullYear()-a.getFullYear();
      const anniversaryPassed=(b.getMonth()>a.getMonth())||(b.getMonth()===a.getMonth()&&b.getDate()>=a.getDate());
      if(!anniversaryPassed) years--;
      years=Math.max(0,years);
      let nextAnniv=new Date(b.getFullYear(),a.getMonth(),a.getDate());
      if(nextAnniv<=b) nextAnniv=new Date(b.getFullYear()+1,a.getMonth(),a.getDate());
      const toNext=Math.ceil((nextAnniv-b)/86400000);
      showResult("date-result", `<span class="result-label">${name}</span><strong class="big">${diff===0?"D-Day":diff>0?"D-"+diff:"D+"+Math.abs(diff)}</strong>
        <div class="result-grid"><div class="result-item"><small>두 날짜 차이</small><strong>${Math.abs(diff).toLocaleString()}일</strong></div>
        <div class="result-item"><small>경과 주수</small><strong>${(Math.abs(diff)/7).toFixed(1)}주</strong></div>
        <div class="result-item"><small>해당 주년</small><strong>${years>0?years+"주년":"1주년 전"}</strong></div>
        <div class="result-item"><small>다음 주년까지</small><strong>${toNext}일</strong></div></div>`);
    } else {
      const b=getDateParts("base-date"), n=parseInt($("#offset-days").value);
      if(!b||Number.isNaN(n)) return alert("기준일과 일수를 올바르게 입력해주세요.");
      const d=new Date(b); d.setDate(d.getDate()+n);
      showResult("date-result",`<span class="result-label">${dateText(b)}에서 ${n>=0?n+"일 후":Math.abs(n)+"일 전"}</span><strong class="big">${dateText(d)}</strong>`);
    }
  };
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
   "부피":{L:["리터(L)",1],mL:["밀리리터(mL)",.001],galUS:["미국 갤런",3.785411784],galUK:["영국 갤런",4.54609],floz:["미국 액량온스",.0295735295625]},
   "온도":{C:["섭씨(℃)",null],F:["화씨(℉)",null],K:["켈빈(K)",null]}
  };
  $("#unit-category").innerHTML=Object.keys(data).map(x=>`<option>${x}</option>`).join("");
  function fill(){const cat=$("#unit-category").value,opts=Object.entries(data[cat]).map(([v,[t]])=>`<option value="${v}">${t}</option>`).join("");$("#unit-from").innerHTML=opts;$("#unit-to").innerHTML=opts;$("#unit-to").selectedIndex=1;convert();}
  function convert(){const v=parseFloat($("#unit-value").value),cat=$("#unit-category").value,from=$("#unit-from").value,to=$("#unit-to").value;if(Number.isNaN(v)){ $("#unit-live-result").textContent="-"; return;}let r;if(cat==="온도"){let c=from==="C"?v:from==="F"?(v-32)*5/9:v-273.15;r=to==="C"?c:to==="F"?c*9/5+32:c+273.15;}else r=v*data[cat][from][1]/data[cat][to][1];$("#unit-live-result").textContent=number(r);}
  fill();
  ["unit-category","unit-from","unit-to"].forEach(id=>$("#"+id).onchange=id==="unit-category"?fill:convert);
  $("#unit-value").oninput=convert;
  $("#unit-swap").onclick=()=>{const a=$("#unit-from").value;$("#unit-from").value=$("#unit-to").value;$("#unit-to").value=a;convert();};
 },
 bmi() {
  $("#bmi-calc").onclick=()=>{const h=parseFloat($("#height").value),w=parseFloat($("#weight").value);if(!(h>0&&w>0))return alert("키와 몸무게를 입력해주세요.");const bmi=w/((h/100)**2);let cls,guide;if(bmi<18.5){cls="저체중";guide=["규칙적인 식사와 충분한 단백질 섭취를 살펴보세요.","원치 않는 체중 감소가 이어지면 의료진과 상담해보세요."];}else if(bmi<23){cls="정상 범위";guide=["현재 생활습관을 꾸준히 유지해보세요.","주 150분 정도의 중강도 신체활동을 목표로 해보세요."];}else if(bmi<25){cls="과체중 전단계";guide=["음료·간식의 당류와 야식 빈도를 먼저 점검해보세요.","걷기와 근력운동을 무리 없이 꾸준히 시작해보세요."];}else if(bmi<30){cls="1단계 비만";guide=["체중의 5~10% 감량도 건강상 이점이 있을 수 있습니다.","식사·활동·수면을 조정하는 생활습관 관리가 우선입니다.","고혈압·당뇨병·이상지질혈증 등 동반질환이 있거나 반복적인 감량 실패가 있다면 의료진이 처방치료 필요성을 검토할 수 있습니다."];}else{cls="2단계 이상 비만";guide=["먼저 식사·활동·수면을 포함한 생활습관을 현실적으로 조정하는 것이 체중관리의 기본입니다.","이 범위에서는 의료전문가가 동반질환과 과거 감량 시도 등을 평가해 비만치료제 사용 가능성을 검토할 수 있습니다.","위고비·마운자로 등 약물은 호르몬제가 아니라 식욕과 대사에 관여하는 처방 비만치료제이며, 개인 판단으로 시작하지 말고 반드시 의료진과 상담해야 합니다."];}showResult("bmi-result",`<span class="result-label">체질량지수</span><strong class="big">${bmi.toFixed(1)} · ${cls}</strong><div class="health-guide"><h3>생활관리 안내</h3><ul>${guide.map(x=>`<li>${x}</li>`).join("")}</ul></div>`);};
 },
 salary() {
  bindMoneyInputs();
  let mode="takehome";
  let raiseMode="newSalary";

  $$("[data-salary-mode]").forEach(b=>b.onclick=()=>{
    $$("[data-salary-mode]").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    mode=b.dataset.salaryMode;
    $("#takehome-fields").hidden=mode!=="takehome";
    $("#raise-fields").hidden=mode==="takehome";
    $("#salary-result").classList.remove("show");
  });

  $$("[data-raise-mode]").forEach(b=>b.onclick=()=>{
    $$("[data-raise-mode]").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    raiseMode=b.dataset.raiseMode;
    $("#raise-by-new").hidden=raiseMode!=="newSalary";
    $("#raise-by-rate").hidden=raiseMode!=="rate";
    $("#salary-result").classList.remove("show");
  });

  $("#salary-calc").onclick=()=>{
    if(mode==="takehome"){
      const a=parseMoney($("#annual-salary").value);
      if(!(a>0)) return alert("연봉을 입력해주세요.");
      const monthly=a/12;
      const pensionBase=Math.min(monthly,6590000), pension=pensionBase*.0475;
      const health=monthly*.03595, care=monthly*.004724, employment=monthly*.009;
      const social=pension+health+care+employment;
      const taxable=Math.max(0,monthly-social);
      const incomeTax=Math.max(0,(taxable*0.035)-70000);
      const localTax=incomeTax*.1;
      const deduction=social+incomeTax+localTax, net=monthly-deduction;

      showResult("salary-result",`
        <span class="result-label">2026년 기준 예상 월 실수령액</span>
        <strong class="big">${money(net)}</strong>
        <div class="result-grid">
          <div class="result-item"><small>월 세전</small><strong>${money(monthly)}</strong></div>
          <div class="result-item"><small>국민연금(근로자분)</small><strong>${money(pension)}</strong></div>
          <div class="result-item"><small>건강·장기요양</small><strong>${money(health+care)}</strong></div>
          <div class="result-item"><small>고용보험</small><strong>${money(employment)}</strong></div>
          <div class="result-item"><small>소득·지방소득세(간이)</small><strong>${money(incomeTax+localTax)}</strong></div>
          <div class="result-item"><small>예상 총 공제</small><strong>${money(deduction)}</strong></div>
        </div>`);
      return;
    }

    const oldSalary=parseMoney($("#old-salary").value);
    if(!(oldSalary>0)) return alert("기존 연봉을 입력해주세요.");

    if(raiseMode==="newSalary"){
      const newSalary=parseMoney($("#new-salary").value);
      if(!(newSalary>0)) return alert("변경 연봉을 입력해주세요.");
      const diff=newSalary-oldSalary;
      const rate=diff/oldSalary*100;

      showResult("salary-result",`
        <span class="result-label">연봉 변화율</span>
        <strong class="big">${rate>=0?"+":""}${rate.toFixed(2)}%</strong>
        <div class="result-grid">
          <div class="result-item"><small>변경 연봉</small><strong>${money(newSalary)}</strong></div>
          <div class="result-item"><small>연간 증감액</small><strong>${diff>=0?"+":""}${money(diff)}</strong></div>
          <div class="result-item"><small>월 세전 증감</small><strong>${diff>=0?"+":""}${money(diff/12)}</strong></div>
          <div class="result-item"><small>변경 월 세전</small><strong>${money(newSalary/12)}</strong></div>
        </div>`);
    } else {
      const rate=parseFloat($("#raise-rate").value);
      if(Number.isNaN(rate)) return alert("연봉 상승률을 입력해주세요.");
      const newSalary=oldSalary*(1+rate/100);
      const diff=newSalary-oldSalary;

      showResult("salary-result",`
        <span class="result-label">${rate>=0?rate.toFixed(2)+"% 인상":"감소"} 적용 변경 연봉</span>
        <strong class="big">${money(newSalary)}</strong>
        <div class="result-grid">
          <div class="result-item"><small>기존 연봉</small><strong>${money(oldSalary)}</strong></div>
          <div class="result-item"><small>연간 증감액</small><strong>${diff>=0?"+":""}${money(diff)}</strong></div>
          <div class="result-item"><small>월 세전 증감</small><strong>${diff>=0?"+":""}${money(diff/12)}</strong></div>
          <div class="result-item"><small>변경 월 세전</small><strong>${money(newSalary/12)}</strong></div>
        </div>`);
    }
  };
 },
 retirement() {
  bindDateParts("join-date"); bindDateParts("leave-date"); bindMoneyInputs();
  $("#retire-calc").onclick=()=>{const start=getDateParts("join-date"),end=getDateParts("leave-date"),p=parseMoney($("#three-month-pay").value);if(!start||!end||!(p>0))return alert("입사일, 퇴사일, 최근 3개월 임금을 입력해주세요.");const days=Math.floor((end-start)/86400000)+1;if(days<365)return alert("근속기간이 1년 미만입니다. 일반적인 법정 퇴직금 대상 여부를 별도로 확인해주세요.");const avgDaily=p/90;const result=avgDaily*30*(days/365);showResult("retire-result",`<span class="result-label">예상 퇴직금</span><strong class="big">${money(result)}</strong><div class="result-grid"><div class="result-item"><small>근속일수</small><strong>${days.toLocaleString()}일</strong></div><div class="result-item"><small>1일 평균임금(간이)</small><strong>${money(avgDaily)}</strong></div></div>`);};
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
