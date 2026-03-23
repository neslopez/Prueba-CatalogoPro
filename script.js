let productos = JSON.parse(localStorage.getItem("productos")) || [];
let categorias = JSON.parse(localStorage.getItem("categorias")) || [];

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded",()=>{

cargarNegocio();
poblarCategorias();
renderProductos();
actualizarStats();

$("btnAgregar").onclick=()=>abrirModal();
$("cancelar").onclick=cerrarModal;
$("guardar").onclick=guardarProducto;
$("imagen").onchange=previewImagen;
$("btnAddCategoria").onclick=agregarCategoria;
$("btnPDF").onclick=generarPDF;

});

/* NEGOCIO */

function cargarNegocio(){

$("nombreNegocio").value = localStorage.getItem("nombreNegocio") || "";

$("nombreNegocio").oninput=e=>{
localStorage.setItem("nombreNegocio",e.target.value);
verificarFlujo();
};

$("logoNegocio").onchange=e=>{
const reader=new FileReader();
reader.onload=ev=>{
localStorage.setItem("logoNegocio",ev.target.result);
$("previewLogo").src=ev.target.result;
verificarFlujo();
};
reader.readAsDataURL(e.target.files[0]);
};

$("previewLogo").src = localStorage.getItem("logoNegocio") || "";

}

/* FLUJO */

function verificarFlujo(){

const nombre = localStorage.getItem("nombreNegocio");
const logo = localStorage.getItem("logoNegocio");

$("btnAgregar").disabled = !(nombre && logo && categorias.length>0);

}

/* CATEGORIAS */

function agregarCategoria(){

const val=$("nuevaCategoria").value.trim();
if(!val) return;

categorias.push(val);

localStorage.setItem("categorias",JSON.stringify(categorias));

poblarCategorias();
actualizarStats();
verificarFlujo();

$("nuevaCategoria").value="";

}

function poblarCategorias(){

$("categoria").innerHTML="";
$("filtroCategoria").innerHTML="";

categorias.forEach(c=>{
$("categoria").innerHTML+=`<option>${c}</option>`;
$("filtroCategoria").innerHTML+=`<option>${c}</option>`;
});

}

/* PRODUCTOS */

function guardarProducto(){

const nuevo={
nombre:$("nombre").value,
precio:$("precio").value,
categoria:$("categoria").value,
imagen:$("preview").src,
destacado:$("destacado").checked,
oferta:$("oferta").checked
};

productos.push(nuevo);

localStorage.setItem("productos",JSON.stringify(productos));

renderProductos();
actualizarStats();
cerrarModal();

}

function renderProductos(){

const cont=$("contenedorProductos");
cont.innerHTML="";

productos.forEach((p,i)=>{

const badges =
(p.destacado ? `<div class="badge destacado">⭐</div>` : "") +
(p.oferta ? `<div class="badge oferta">🔥</div>` : "");

cont.innerHTML+=`
<div class="producto ${p.destacado?'destacado':''} ${p.oferta?'oferta':''}">
${badges}
<img src="${p.imagen}">
<h3>${p.nombre}</h3>
<p>$${p.precio}</p>
</div>
`;

});

}

/* MODAL */

function abrirModal(){
$("modal").classList.remove("oculto");
}

function cerrarModal(){
$("modal").classList.add("oculto");
}

/* IMAGEN */

function previewImagen(e){
const reader=new FileReader();
reader.onload=ev=>{
$("preview").src=ev.target.result;
};
reader.readAsDataURL(e.target.files[0]);
}

/* STATS */

function actualizarStats(){
$("statTotal").textContent=productos.length;
$("statOfertas").textContent=productos.filter(p=>p.oferta).length;
$("statDestacados").textContent=productos.filter(p=>p.destacado).length;
$("statCategorias").textContent=categorias.length;
}

/* PDF */

function generarPDF(){

const nombre = localStorage.getItem("nombreNegocio") || "Catálogo";
const logo = localStorage.getItem("logoNegocio");

let html = `<div style="text-align:center">`;

if(logo) html+=`<img src="${logo}" width="80"><br>`;
html+=`<h1>${nombre}</h1></div>`;

const cats=[...new Set(productos.map(p=>p.categoria))];

cats.forEach(cat=>{

html+=`<h2>${cat}</h2><div style="display:flex;flex-wrap:wrap">`;

productos.filter(p=>p.categoria===cat).forEach(p=>{

html+=`
<div style="width:120px;margin:10px;text-align:center;border:1px solid #ccc;padding:5px">

${p.destacado ? "⭐" : ""} ${p.oferta ? "🔥" : ""}

<img src="${p.imagen}" style="width:100px;height:80px;object-fit:contain">
<p>${p.nombre}</p>
<b>$${p.precio}</b>

</div>
`;

});

html+=`</div>`;

});

html2pdf().from(html).save();

}
