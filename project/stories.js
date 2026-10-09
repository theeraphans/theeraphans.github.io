const workflows = {
  platform: [['Request','A customer asks to change a shipment.'],['Agent','The agent identifies the intent and selects a shipment lookup tool.'],['MCP tool','Retrieve shipment context before proposing an action.'],['Human review','Pause for approval of the consequential action.'],['Response','Return a confirmation that can be traced and evaluated.']],
  voc: [['Channels','Email and call data enter the pipeline.'],['Classify','Identify intent and sentiment from voice and text.'],['Retrieve','Multi-RAG retrieves business context.'],['Route','Route to the responsible team and escalate urgent cases.'],['Measure','Traces and Power BI support operational analysis.']],
  sales: [['Transactions','Start with order, payment, and customer records.'],['Detect','Identify missing or conflicting information.'],['Timing','Analyze lead time and follow-up windows.'],['Recommend','Prioritize recovery opportunities and recommend a next action.'],['Follow-up','Support repeatable follow-up workflows.']],
  data: [['Sources','Business systems, files, and APIs provide source data.'],['Airflow','Scheduled pipelines collect and move the data.'],['dbt','Reusable models transform and organize it.'],['Warehouse','Centralize data and reporting logic.'],['Power BI','Support analytics and automation.']],
  vision: [['Shelf photo','Start with an image of the shelf.'],['Detect','Locate products in the image.'],['Classify','Assign product categories using the vision ensemble.'],['Match','Match products against the reference catalog.'],['Analyze','Produce availability and placement data.']],
  hermes: [['Portal','A user works in the enterprise portal.'],['BFF','Enforce identity, session ownership, and the credential boundary.'],['Agent','Stream agent execution and tool activity.'],['Memory','Honcho provides persistent context.']]
};
document.querySelectorAll('[data-workflow]').forEach((host,number)=>{
  const steps=workflows[host.dataset.workflow];let current=0;
  const label=document.createElement('p');label.className='figure-label';
  const track=document.createElement('div');track.className='figure-track';track.setAttribute('role','group');track.setAttribute('aria-label','Workflow steps');
  const caption=document.createElement('div');caption.className='figure-caption';caption.setAttribute('aria-live','polite');
  const controls=document.createElement('div');controls.className='figure-controls';
  const previous=document.createElement('button');previous.type='button';previous.textContent='← Previous';
  const next=document.createElement('button');next.type='button';
  const buttons=steps.map(([title],index)=>{const button=document.createElement('button');button.type='button';button.textContent=title;button.addEventListener('click',()=>show(index));if(index){const arrow=document.createElement('span');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');track.append(arrow)}track.append(button);return button});
  function show(index){current=index;label.textContent='Fig. '+(number+1)+' / '+(current+1)+' of '+steps.length;buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));const title=document.createElement('strong');title.textContent=steps[current][0];const text=document.createElement('span');text.textContent=steps[current][1];caption.replaceChildren(title,text);previous.disabled=current===0;next.textContent=current===steps.length-1?'Start again ↺':'Next step →'}
  previous.addEventListener('click',()=>show(current-1));next.addEventListener('click',()=>show((current+1)%steps.length));controls.append(previous,next);
  const note=document.createElement('p');note.className='figure-note';note.textContent='Illustrative walkthrough. No live model, business tool, or customer data is connected.';
  host.append(label,track,caption,controls,note);show(0);
});
