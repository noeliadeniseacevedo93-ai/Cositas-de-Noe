
const productos = [
  {
    id: 1,
    marca: "Natura",
    nombre: "Hidratante Corporal Pera y Flor de Loto",
    categoria: "Hidratación",
    descripcion: "Hidratación y suavidad para todos los días.",
    precio: 17900,
    imagen: "CremaPerayFlordeLoto.webp",
    stock: 1
  },
  {
    id: 2,
    marca: "Natura",
    nombre: "Perfume Paz e Humor",
    categoria: "Fragancias",
    descripcion: "Las fragancias que siempre te acompañan.",
    precio: 46000,
    imagen: "PazeHumor.webp",
    stock: 1
  },
  {
    id: 3,
    marca: "Natura",
    nombre: "Perfume Kaiak Urbe",
    categoria: "Fragancias",
    descripcion: "Una fragancia para acompañarte cada día.",
    precio: 46000,
    imagen: "KaiakUrbe.webp",
    stock: 1
  },
  {
    id: 4,
    marca: "Natura",
    nombre: "RF Ac. Tododía Flor de Cereza y Aguacate",
    categoria: "Cabello",
    descripcion: "Cuidado especial para cada cabello.",
    precio: 7200,
    imagen: "RFTodoFlordeCerezayagua.webp",
    stock: 1
  },
  {
    id: 5,
    marca: "Natura",
    nombre: "RF Shampoo Restauración y Liso",
    categoria: "Cabello",
    descripcion: "Cuidado especial para tu cabello.",
    precio: 8800,
    imagen: "RFShRestauyLisoP.webp",
    stock: 1
  },
  {  id: 6,
    marca: "Avon",
    nombre: "Hid. Care Lichi y Aloe Vera",
    categoria: "Hidratación",
    descripcion: "Hidratación Refrescante",
    precio: 12100,
    imagen: "carelichiyaloe.webp",
    stock: 1
  },
  {  id: 7,
    marca: "Casa y Estilo",
    nombre: "Copa de Champagne",
    categoria: "Artículos del Hogar",
    descripcion: "Estilo",
    precio: 6000,
    imagen: "CopaChampagne.webp",
    stock: 8
  }
];

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
  return precio.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });
}

// Abrir la categoría seleccionada.
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
  // Obtener las categorías que existen en esta marca.
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

// Volver a la portada con los tres banners.
function volverAlInicio() {
  catalogo.hidden = true;
  inicio.hidden = false;

  window.scrollTo({ top: 0, behavior: "smooth" });
}
function mostrarFiltrosCategorias() {
  filtrosCategorias.innerHTML = "";

  // Obtener las categorías que existen en esta marca.
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
// Mostrar solamente los productos de la marca seleccionada.
function mostrarProductos() {
  listaProductos.innerHTML = "";

  // Primero filtramos por marca.
  const productosMarca = productos.filter(
    producto => producto.marca === marcaActual
  );

  // Después filtramos por categoría.
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

    const stockDisponible =
      producto.stock - cantidadEnCarrito;

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
        <p class="descripcion">${producto.descripcion}</p>

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
      </div>
    `;

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

// Controlar cantidades y eliminar productos.
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

  let mensaje = "¡Hola! Quiero hacer este pedido de Cositas de Noe:\n\n";
  let total = 0;

  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    mensaje += `- ${item.nombre} x ${item.cantidad}: ${formatoPrecio(subtotal)}\n`;
  });

  mensaje += `\nTotal estimado: ${formatoPrecio(total)}`;
  mensaje += "\n\n¿Me confirmás disponibilidad? ¡Gracias!";

  const url =
    `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, "_blank");
});

// Estado inicial.
mostrarCarrito();
