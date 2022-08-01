let addbtn = document.querySelector(".add-btn");
let removebtn = document.querySelector(".rem-btn");

let toolboxcolors=document.querySelectorAll(".color");

let maincont = document.querySelector(".main-cont");

let modal = document.querySelector(".modal-cont");
let textareacont = document.querySelector(".textarea-cont");
let allpriocolors = document.querySelectorAll(".prio-col");



let colors = ["lightpink", "lightblue", "lightgreen", "blueviolet"];
let modalpriocolo = colors[colors.length - 1];


let addflag = false;
let removeflag = false; 

let lockclass ="fa-lock";
let unlockclass ="fa-lock-open";

let ticketsarr = [];

if(localStorage.getItem("jira_ticket"))
{
    // retrive and display tickets
    ticketsarr = JSON.parse(localStorage.getItem("jira_ticket"));
    ticketsarr.forEach((ticketobj) =>
    {
        createticket(ticketobj.ticketcolor,ticketobj.tickettask,ticketobj.ticketid);
    })
}

//step 
//color ki prio k sath ticket filter krna single click pr;
//dbl click pr sare ticket show krna;
for(let i=0;i<toolboxcolors.length;i++)
{
    toolboxcolors[i].addEventListener("click",(e) =>
    {
        let currenttolboxcolor=toolboxcolors[i].classList[0];

        let filteredtickets =ticketsarr.filter((ticketobj,idx) =>
        {
            return currenttolboxcolor === ticketobj.ticketcolor;
        })

        //remove previous ticket 
        let allticketscont =document.querySelectorAll(".tic-cont");
        for(let i=0; i<allticketscont.length;i++)
        {
            allticketscont[i].remove();
        }

        //display new filtered tickets;
        filteredtickets.forEach((ticketobj,idx) =>
        {
            createticket(ticketobj.ticketcolor,ticketobj.tickettask,ticketobj.ticketid);
            //yha ye dikkat hai ki create ticket function call hoga 
            //to array mai fhir se naye ticket generate ho jayege;
            //duplicasy aa rhi hai;
        })
    })
    //dbl click event
    toolboxcolors[i].addEventListener("dblclick",(e) =>
    {
        //remove previous ticket 
        let allticketscont =document.querySelectorAll(".tic-cont");
        for(let i=0; i<allticketscont.length;i++)
        {
            allticketscont[i].remove();
        }
        ticketsarr.forEach((ticketobj,idx) =>
        {
            createticket(ticketobj.ticketcolor,ticketobj.tickettask,ticketobj.ticketid);
        })

    })
}


//listner for modal prio color
//ticket mai priocolor konsa dena hai 
//select krna;
allpriocolors.forEach((colorelem, idx) => {
    colorelem.addEventListener("click", (e) => {
        allpriocolors.forEach((priocolelem, idx) => {
            priocolelem.classList.remove("border");
        })
        colorelem.classList.add("border");
        modalpriocolo = colorelem.classList[0];
    })
})
// 1 st step
//add btn pr click krne pr modal open krna
addbtn.addEventListener("click", (e) => {
    //display modal
    //generate ticket
    //addflag true huaa to->modal display
    //addflag false huaa to ->none
    addflag = !addflag;
    if (addflag) {
        modal.style.display = "flex";

    }
    else {
        modal.style.display = "none";
    }
    //console.log(addflag);


    //console.log("clicked")
})

removebtn.addEventListener("click", (e) =>
{
    removeflag = !removeflag;
})
//step 2
// ticket generate kr k main container mai add krna
modal.addEventListener("keydown", (e) => {
    let key = e.key;
    if (key === "Shift") {

        //createticket(modalpriocolo, textareacont.value, shortid());
        createticket(modalpriocolo, textareacont.value);
        addflag = false;
        setmodaldefault();
        
        //textareacont.innerText = "";
        //ye special caracter hai yha innertext nhi "value"
        // likhna padega;
        
    }
}) 
//step 3 
// ticket generate krna 
function createticket(ticketcolor, tickettask, ticketid) {
    let id = ticketid || shortid();
    let ticketcont = document.createElement("div");
    ticketcont.setAttribute("class", "tic-cont");
    ticketcont.innerHTML = `
        <div class = "tic-col ${ticketcolor}"></div>
        <div class="tic-id">#${id}</div>
        <div class="task-cont">${tickettask}</div>
        <div class="ticket-lock">
         <i class="fa-solid fa-lock"></i>
         </div>
     `;
    maincont.appendChild(ticketcont);

    //create object ticket and add to array
    if(!ticketid)
    {
        ticketsarr.push({ticketcolor, tickettask, ticketid :id });
        //step 7th
        //local storage mai ticket store krne k liye;
        localStorage.setItem("jira_ticket",JSON.stringify(ticketsarr));
    }
    
    

    handleremove(ticketcont,id);
    handlelock(ticketcont,id);//step 3rd
    handlecolor(ticketcont,id); //step 4th
}
function handleremove(ticket,id)
{

    //REMOVE
    //removeflag ->true to ticketremove kro;
    ticket.addEventListener("click",(e) =>
    {
        if(!removeflag)
        {
            return; 
        }
        let idx = getticketidx(id);
        //data base removal
        ticketsarr.splice(idx,1);
        let stringticketarr = JSON.stringify(ticketsarr);
        localStorage.setItem("jira_ticket",stringticketarr);

        ticket.remove();//ui removal
    })
    
}

//step 3rd 
//lock open hone pr text edit krna
function handlelock(ticket,id)
{
    let ticketlockelem = ticket.querySelector(".ticket-lock");
    let ticketlock = ticketlockelem.children[0];
    let tickettaskcont =ticket.querySelector(".task-cont");
    ticketlock.addEventListener("click", (e) =>
    {
        let ticketidx =getticketidx(id);

        if(ticketlock.classList.contains(lockclass))
        {
            ticketlock.classList.remove(lockclass);
            ticketlock.classList.add(unlockclass);
            tickettaskcont.setAttribute("contenteditable",true);

        }
        else
        {
            ticketlock.classList.remove(unlockclass);
            ticketlock.classList.add(lockclass);
            tickettaskcont.setAttribute("contenteditable",false);
        }
        //step 8th
        //modify data in localstorage (ticket container)
        ticketsarr[ticketidx].tickettask=tickettaskcont.innerText;
        localStorage.setItem("jira_ticket",JSON.stringify(ticketsarr));
    })
}

//step 4th 
//color ki priority change ticket generate 
// hone k bad;
function handlecolor(ticket,id)
{
    let ticketcolor=ticket.querySelector(".tic-col");
    ticketcolor.addEventListener("click",(e)=>
    {
        // get ticketidx from the tickets array 
        let ticketidx = getticketidx(id);

        let currentticketcolor=ticketcolor.classList[1];
        let currentticketcoloridx = colors.findIndex((color)=>
        {
            return currentticketcolor === color;
        })
        currentticketcoloridx++;
        let newticketcoloridx=currentticketcoloridx % colors.length;
        let newticketcolor =colors[newticketcoloridx];
        ticketcolor.classList.remove(currentticketcolor);
        ticketcolor.classList.add(newticketcolor);
        // step 6th 
        // modify data in localstorage (priority color change)
        ticketsarr[ticketidx].ticketcolor = newticketcolor;
        localStorage.setItem("jira_ticket",JSON.stringify(ticketsarr));

    })
}
function getticketidx(id)
{
     let ticketidx = ticketsarr.findIndex((ticketobj) => 
     {
        return ticketobj.ticketid === id;
     })
     return ticketidx;
}
//step 5th
//default clr set krne k liye 
function setmodaldefault()
{
    modal.style.display = "none";
    textareacont.value = "";
    modalpriocolo = colors[colors.length - 1];
    allpriocolors.forEach((priocolelem, idx) => {
        priocolelem.classList.remove("border");
    })
    allpriocolors[allpriocolors.length-1].classList.add("border");
}

