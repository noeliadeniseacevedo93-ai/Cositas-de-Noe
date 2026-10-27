
let productos = [];

const carrito = [];
const PRODUCTOS_POR_PAGINA = 6;

let marcaActual = "";
let cantidadVisible = PRODUCTOS_POR_PAGINA;
let categoriaActual = "Todos";

const filtrosCategorias = document.getElementById("filtros-categorias");
const inicio = document.getElementById("inicio");
const catalogo = document.getElementById("catalogo");
const tituloCatalogo = document.getElementById("titulo-catalogo");
const listaProductos = document.getElementById("lista-productos");
const cantidadProductos = document.getElementById("cantidad-productos");
const categoriaVacia = document.getElementById("categoria-vacia");
const botonVerMas = document.getElementById("ver-mas");

const listaCarrito = document.getElementById("lista-carrito");
const carritoVacio = document.getElementById("carrito-vacio");
const totalElemento = document.getElementById("total");
const botonWhatsApp = document.getElementById("enviar-whatsapp");

const NUMERO_WHATSAPP = "5491151538312";

function formatoPrecio(precio) {
  return Number(precio).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });
}
console.log("URL de Supabase:", SUPABASE_URL);
// Consultar productos activos en Supabase.
async function cargarProductos() {
  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("id, marca, nombre, categoria, descripcion, precio, imagen, stock, activo")
      .eq("activo", true)
      .order("id");

    if (error) {
      throw error;
    }

    productos = data.map(producto => ({
      ...producto,
      id: Number(producto.id),
      precio: Number(producto.precio),
      stock: Number(producto.stock),
      imagen: producto.imagen || ""
    }));

    // Si se abrió una marca mientras cargaban los datos,
    // actualizar el catálogo cuando termine la consulta.
    if (marcaActual) {
      mostrarFiltrosCategorias();
      mostrarProductos();
    }

    console.log("Productos cargados:", productos.length);
  } catch (error) {
    console.error("Error al cargar productos:", error);
    alert(
      "No pudimos cargar los productos. Revisá la conexión con Supabase."
    );
  }
}

// Abrir la marca seleccionada.
function abrirCategoria(marca) {
  marcaActual = marca;
  categoriaActual = "Todos";
  cantidadVisible = PRODUCTOS_POR_PAGINA;

  inicio.hidden = true;
  catalogo.hidden = false;

  tituloCatalogo.textContent = marca;

  mostrarFiltrosCategorias();
  mostrarProductos();

  catalogo.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

// Volver a la portada.
function volverAlInicio() {
  catalogo.hidden = true;
  inicio.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// Crear los filtros según las categorías disponibles.
function mostrarFiltrosCategorias() {
  filtrosCategorias.innerHTML = "";

  const categorias = [
    "Todos",
    ...new Set(
      productos
        .filter(producto => producto.marca === marcaActual)
        .map(producto => producto.categoria)
    )
  ];

  categorias.forEach(categoria => {
    const boton = document.createElement("button");

    boton.type = "button";
    boton.textContent = categoria;
    boton.className = "boton-filtro";

    if (categoria === categoriaActual) {
      boton.classList.add("activo");
    }

    boton.addEventListener("click", () => {
      categoriaActual = categoria;
      cantidadVisible = PRODUCTOS_POR_PAGINA;

      mostrarFiltrosCategorias();
      mostrarProductos();
    });

    filtrosCategorias.appendChild(boton);
  });
}

// Mostrar los productos de la marca y categoría seleccionadas.
function mostrarProductos() {
  listaProductos.innerHTML = "";

  const productosMarca = productos.filter(
    producto => producto.marca === marcaActual
  );

  const productosFiltrados = productosMarca.filter(
    producto =>
      categoriaActual === "Todos" ||
      producto.categoria === categoriaActual
  );

  const productosVisibles = productosFiltrados.slice(
    0,
    cantidadVisible
  );

  cantidadProductos.textContent =
    `${productosFiltrados.length} ${
      productosFiltrados.length === 1
        ? "producto"
        : "productos"
    }`;

  categoriaVacia.hidden = productosFiltrados.length > 0;

  productosVisibles.forEach(producto => {
    const itemCarrito = carrito.find(
      item => item.id === producto.id
    );

    const cantidadEnCarrito = itemCarrito
      ? itemCarrito.cantidad
      : 0;

    const stockDisponible = Math.max(
      0,
      producto.stock - cantidadEnCarrito
    );

    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";

    tarjeta.innerHTML = `
      <div class="imagen-producto">
        <img
          src="${producto.imagen}"
          alt="${producto.nombre}"
          loading="lazy"
        >
      </div>

      <div class="contenido-tarjeta">
        <p class="categoria">${producto.categoria}</p>
        <h3>${producto.nombre}</h3>
        <p class="descripcion">${producto.descripcion || ""}</p>

        <p class="stock">
          ${
            stockDisponible > 0
              ? `Disponibles: ${stockDisponible}`
              : "Sin stock"
          }
        </p>

       
        <div class="fila-precio">
          <span class="precio">
            ${formatoPrecio(producto.precio)}
          </span>

          <button
            class="boton-agregar"
            type="button"
            data-id="${producto.id}"
            ${stockDisponible <= 0 ? "disabled" : ""}
          >
            ${stockDisponible > 0 ? "+ Agregar" : "Sin stock"}
          </button>
        </div>

        <button
          class="boton-compartir"
          type="button"
          data-compartir-id="${producto.id}"
        >
          Compartir producto
        </button>


    // Las imágenes se guardan en GitHub.
    // Si una imagen no existe, ocultamos solamente esa imagen.
    const imagen = tarjeta.querySelector("img");

    imagen.addEventListener("error", () => {
      imagen.style.display = "none";
    });

    listaProductos.appendChild(tarjeta);
  });

  botonVerMas.hidden =
    cantidadVisible >= productosFiltrados.length;
}

// Los banners abren cada marca.
document.querySelectorAll("[data-categoria]").forEach(boton => {
  boton.addEventListener("click", () => {
    abrirCategoria(boton.dataset.categoria);
  });
});

document.getElementById("volver-categorias")
  .addEventListener("click", volverAlInicio);

document.getElementById("ir-inicio")
  .addEventListener("click", volverAlInicio);

// El enlace Marcas vuelve a la portada.
document.querySelector('a[href="#categorias"]')
  .addEventListener("click", evento => {
    evento.preventDefault();
    volverAlInicio();

    document.getElementById("categorias").scrollIntoView({
      behavior: "smooth"
    });
  });

// Cargar los siguientes seis productos.
botonVerMas.addEventListener("click", () => {
  cantidadVisible += PRODUCTOS_POR_PAGINA;
  mostrarProductos();
});

// Agregar productos al carrito.
function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const item = carrito.find(p => p.id === id);
  const cantidadActual = item ? item.cantidad : 0;

  if (cantidadActual >= producto.stock) {
    alert("No hay más unidades disponibles de este producto.");
    return;
  }

  if (item) {
    item.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1
    });
  }

  mostrarProductos();
  mostrarCarrito();
}

listaProductos.addEventListener("click", evento => {
  const boton = evento.target.closest("[data-id]");

  if (boton && !boton.disabled) {
    agregarAlCarrito(Number(boton.dataset.id));
  }
});

// Mostrar el carrito y calcular el total.
function mostrarCarrito() {
  listaCarrito.innerHTML = "";
  carritoVacio.hidden = carrito.length > 0;

  let total = 0;

  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const fila = document.createElement("li");
    fila.className = "item-carrito";

    fila.innerHTML = `
      <div>
        <strong>${item.nombre}</strong><br>
        <span>${formatoPrecio(item.precio)} c/u</span><br>
        <span>Subtotal: ${formatoPrecio(subtotal)}</span>
      </div>

      <div class="controles-cantidad">
        <button class="boton-cantidad" type="button"
          data-accion="restar" data-id="${item.id}"
          aria-label="Restar una unidad">−</button>

        <span>${item.cantidad}</span>

        <button class="boton-cantidad" type="button"
          data-accion="sumar" data-id="${item.id}"
          aria-label="Sumar una unidad">+</button>

        <button class="boton-quitar" type="button"
          data-accion="quitar" data-id="${item.id}">Quitar</button>
      </div>
    `;

    listaCarrito.appendChild(fila);
  });

  totalElemento.textContent = formatoPrecio(total);
}

// Controlar cantidades y quitar productos.
listaCarrito.addEventListener("click", evento => {
  const boton = evento.target.closest("[data-accion]");
  if (!boton) return;

  const id = Number(boton.dataset.id);
  const indice = carrito.findIndex(item => item.id === id);

  if (indice === -1) return;

  if (boton.dataset.accion === "sumar") {
    const producto = productos.find(p => p.id === id);

    if (producto && carrito[indice].cantidad < producto.stock) {
      carrito[indice].cantidad++;
    } else {
      alert("No hay más unidades disponibles de este producto.");
    }
  } else if (boton.dataset.accion === "restar") {
    carrito[indice].cantidad--;

    if (carrito[indice].cantidad <= 0) {
      carrito.splice(indice, 1);
    }
  } else if (boton.dataset.accion === "quitar") {
    carrito.splice(indice, 1);
  }

  mostrarCarrito();
  mostrarProductos();
});

// Preparar el pedido de WhatsApp.
botonWhatsApp.addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("Primero agregá al menos un producto al pedido.");
    return;
  }

  if (NUMERO_WHATSAPP.includes("X")) {
    alert("Configurá tu número de WhatsApp en script.js.");
    return;
  }

  let mensaje =
    "¡Hola! Quiero hacer este pedido de Cositas de Noe:\n\n";

  let total = 0;

  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    mensaje +=
      `- ${item.nombre} x ${item.cantidad}: ${formatoPrecio(subtotal)}\n`;
  });

  mensaje += `\nTotal estimado: ${formatoPrecio(total)}`;
  mensaje += "\n\n¿Me confirmás disponibilidad? ¡Gracias!";

  const url =
    `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, "_blank");
});

// Estado inicial y carga desde la base de datos.
mostrarCarrito();
cargarProductos();

const URL_COMPARTIR =
  "https://cositas-de-noe-compartir.noeliadeniseacevedo93.workers.dev/";

listaProductos.addEventListener("click", async function(event) {
  const boton = event.target.closest("[data-compartir-id]");

  if (!boton) return;

  const id = boton.dataset.compartirId;

  const producto = productos.find(
    producto => String(producto.id) === String(id)
  );

  if (!producto) return;

  const enlace = `${URL_COMPARTIR}?id=${encodeURIComponent(id)}`;

  const texto =
    `${producto.nombre} - ${formatoPrecio(producto.precio)}\n` +
    `Mirá este producto de Cositas de Noe: ${enlace}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: producto.nombre,
        text: texto,
        url: enlace
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("No se pudo compartir:", error);
      }
    }
  } else {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(texto)}`,
      "_blank"
    );
  }
});
