/* script limpio */

let productos = JSON.parse(localStorage.getItem("productos")) || [];
let categorias = JSON.parse(localStorage.getItem("categorias")) || [];

let editIndex = null;

const $ = id => document.getElementById(id);

const contenedor = $("contenedorProductos");
const filtro = $("filtroCategoria");
const btnAgregar = $("btnAgregar");
const btnPDF = $("btnPDF");
const btnAddCategoria = $("btnAddCategoria");
const nuevaCategoriaInput = $("nuevaCategoria");

const modal = $("modal");
const nombre = $("nombre");
const precio = $("precio");
const categoriaSelect = $("categoria");
const imagen = $("imagen");
const preview = $("preview");
const destacado = $("destacado");
const oferta = $("oferta");
const btnGuardar = $("guardar");
const btnCancelar = $("cancelar");

const inputNombreNegocio = $("nombreNegocio");
const inputLogoNegocio = $("logoNegocio");
const previewLogo = $("previewLogo");

/* INIT */
document.addEventListener("DOMContentLoaded",()=>{

poblarFiltros();
renderProductos(productos);

const nombreGuardado = localStorage.getItem("nombreNegocio");
const logoGuardado = localStorage.getItem("logoNegocio");

if(nombreGuardado) inputNombreNegocio.value = nombreGuardado;
if(logoGuardado) previewLogo.src = logoGuardado;

/* guardar negocio */
inputNombreNegocio.addEventListener("input",()=>{
localStorage.setItem("nombreNegocio",inputNombreNegocio.value);
});

inputLogoNegocio.addEventListener("change",(e)=>{
const file = e.target.files[0];
if(!file) return;

const reader = new FileReader();
reader.onload = ev=>{
localStorage.setItem("logoNegocio",ev.target.result);
previewLogo.src = ev.target.result;
};
reader.readAsDataURL(file);
});

/* eventos */
btnAgregar.addEventListener("click",abrirModal);
btnGuardar.addEventListener("click",guardarProducto);
btnCancelar.addEventListener("click",cerrarModal);
imagen.addEventListener("change",previewImagen);
btnPDF.addEventListener("click",generarPDF);

btnAddCategoria.addEventListener("click",()=>{
const v = nuevaCategoriaInput.value.trim();
if(!v) return alert("Escribí una categoría");

if(!categorias.includes(v)){
categorias.push(v);
localStorage.setItem("categorias",JSON.stringify(categorias));
}

poblarFiltros();
nuevaCategoriaInput.value="";
});

});

/* CATEGORIAS */
function poblarFiltros(){

filtro.innerHTML="";

["todas","destacados","ofertas"].forEach(v=>{
const opt=document.createElement("option");
opt.value=v;
opt.textContent=v;
filtro.appendChild(opt);
});

categorias.forEach(cat=>{
const opt=document.createElement("option");
opt.value=cat;
opt.textContent=cat;
filtro.appendChild(opt);
});

categoriaSelect.innerHTML="";
categorias.forEach(cat=>{
const opt=document.createElement("option");
opt.value=cat;
opt.textContent=cat;
categoriaSelect.appendChild(opt);
});

}

/* MODAL */
function abrirModal(){
modal.classList.remove("oculto");
}

function cerrarModal(){
modal.classList.add("oculto");
}

/* IMAGEN */
function previewImagen(e){
const file=e.target.files[0];
const reader=new FileReader();
reader.onload=ev=>{
preview.src=ev.target.result;
};
reader.readAsDataURL(file);
}

/* CRUD */
function guardarProducto(){

const nuevo={
nombre:nombre.value,
precio:Number(precio.value),
categoria:categoriaSelect.value,
imagen:preview.src,
destacado:destacado.checked,
oferta:oferta.checked
};

productos.push(nuevo);
localStorage.setItem("productos",JSON.stringify(productos));

renderProductos(productos);
cerrarModal();
}

/* RENDER */
function renderProductos(list){

contenedor.innerHTML="";

list.forEach((p,i)=>{

const div=document.createElement("div");
div.className="producto";

const badges =
(p.destacado ? `<div class="badge destacado">⭐</div>` : "") +
(p.oferta ? `<div class="badge oferta">🔥</div>` : "");

div.innerHTML=`
${badges}
<img src="${p.imagen}">
<h3>${p.nombre}</h3>
<p>$${p.precio}</p>
`;

contenedor.appendChild(div);

});

}

/* PDF */
function generarPDF(){

const lista = productos;

if(!lista.length){
return alert("No hay productos");
}

const nombreNegocio = localStorage.getItem("nombreNegocio") || "Catálogo";
const logoNegocio = localStorage.getItem("logoNegocio");

const pdfDiv = document.createElement("div");

/* HEADER */
if(logoNegocio){
const img=document.createElement("img");
img.src=logoNegocio;
img.style.width="80px";
pdfDiv.appendChild(img);
}

const titulo=document.createElement("h1");
titulo.textContent=nombreNegocio;
pdfDiv.appendChild(titulo);

/* PRODUCTOS */
lista.forEach(p=>{
const div=document.createElement("div");
div.textContent=p.nombre + " - $" + p.precio;
pdfDiv.appendChild(div);
});

html2pdf().from(pdfDiv).save("catalogo.pdf");

}
