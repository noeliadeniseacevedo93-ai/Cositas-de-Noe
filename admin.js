
const login = document.getElementById("login");
const panel = document.getElementById("panel");
const formLogin = document.getElementById("form-login");
const formProducto = document.getElementById("form-producto");

const mensajeLogin = document.getElementById("mensaje-login");
const mensajeProducto = document.getElementById("mensaje-producto");
const listaProductos = document.getElementById("lista-productos");

let usuarioActual = null;
let productoEditando = null;
let productosAdmin = [];

function mostrarMensaje(elemento, mensaje) {
  elemento.textContent = mensaje;
}

function mostrarPanel(visible) {
  login.style.display = visible ? "none" : "block";
  panel.style.display = visible ? "block" : "none";
}

function limpiarFormulario() {
  formProducto.reset();
  document.getElementById("activo").checked = true;
  productoEditando = null;

  document.getElementById("titulo-formulario").textContent =
    "Agregar producto";

  document.getElementById("guardar").textContent =
    "Guardar producto";

  document.getElementById("cancelar-edicion").hidden = true;
}

function esAdmin(userId) {
  return supabaseClient
    .from("store_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
}

async function verificarAdmin(user) {
  if (!user) {
    usuarioActual = null;
    mostrarPanel(false);
    return false;
  }

  const { data, error } = await esAdmin(user.id);

  if (error) {
    usuarioActual = null;
    mostrarPanel(false);
    mostrarMensaje(
      mensajeLogin,
      "No se pudo verificar el permiso de administración. Revisá las políticas de Supabase."
    );
    return false;
  }

  if (!data) {
    await supabaseClient.auth.signOut();
    usuarioActual = null;
    mostrarPanel(false);
    mostrarMensaje(
      mensajeLogin,
      "Este usuario no está autorizado para administrar la tienda."
    );
    return false;
  }

  usuarioActual = user;
  document.getElementById("usuario").textContent =
    "Sesión iniciada: " + user.email;

  mostrarPanel(true);
  await cargarProductosAdmin();
  return true;
}

formLogin.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  mostrarMensaje(mensajeLogin, "Verificando acceso...");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    mostrarMensaje(mensajeLogin, "No se pudo iniciar sesión. Revisá el correo y la contraseña.");
    return;
  }

  await verificarAdmin(data.user);
});

document.getElementById("cerrar-sesion").addEventListener("click", async function () {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    mostrarMensaje(mensajeProducto, "No se pudo cerrar la sesión.");
    return;
  }

  usuarioActual = null;
  mostrarPanel(false);
  mostrarMensaje(mensajeLogin, "Sesión cerrada.");
});

async function cargarProductosAdmin() {
  listaProductos.replaceChildren();

  const { data, error } = await supabaseClient
    .from("products")
    .select("id, nombre, marca, categoria, descripcion, precio, imagen, stock, activo")
    .order("id", { ascending: true });

if (error) {
  console.error("Error al cargar productos:", error);

  mostrarMensaje(
    mensajeProducto,
    "Error al cargar productos: " + error.message
  );

  return;
}

  productosAdmin = data || [];

  if (productosAdmin.length === 0) {
    listaProductos.textContent = "Todavía no hay productos.";
    return;
  }

  productosAdmin.forEach(function (producto) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "producto";

    const titulo = document.createElement("h3");
    titulo.textContent = producto.nombre;

    const detalles = document.createElement("p");
    detalles.textContent =
      producto.marca + " · " + producto.categoria +
      " · $" + Number(producto.precio).toLocaleString("es-AR");

    const stock = document.createElement("p");
    stock.textContent = "Stock: " + producto.stock;

    const estado = document.createElement("p");
    estado.className = "estado";
    estado.textContent = producto.activo
      ? "Visible en la tienda"
      : "Oculto en la tienda";

    const botonEditar = document.createElement("button");
    botonEditar.type = "button";
    botonEditar.textContent = "Editar";
    botonEditar.addEventListener("click", function () {
      editarProducto(producto);
    });

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.className = "eliminar";
    botonEliminar.addEventListener("click", function () {
      eliminarProducto(producto);
    });

    tarjeta.append(titulo, detalles, stock, estado, botonEditar, botonEliminar);
    listaProductos.appendChild(tarjeta);
  });
}

function editarProducto(producto) {
  productoEditando = producto.id;

  document.getElementById("nombre").value = producto.nombre;
  document.getElementById("marca").value = producto.marca;
  document.getElementById("categoria").value = producto.categoria;
  document.getElementById("descripcion").value = producto.descripcion || "";
  document.getElementById("precio").value = producto.precio;
  document.getElementById("imagen").value = producto.imagen || "";
  document.getElementById("stock").value = producto.stock;
  document.getElementById("activo").checked = producto.activo;

  document.getElementById("titulo-formulario").textContent =
    "Editar producto";

  document.getElementById("guardar").textContent =
    "Guardar cambios";

  document.getElementById("cancelar-edicion").hidden = false;

  mostrarMensaje(mensajeProducto, "Editando: " + producto.nombre);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("cancelar-edicion").addEventListener("click", function () {
  limpiarFormulario();
  mostrarMensaje(mensajeProducto, "Edición cancelada.");
});

formProducto.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  if (!usuarioActual) {
    mostrarMensaje(mensajeProducto, "Iniciá sesión nuevamente.");
    return;
  }

  const nombre = document.getElementById("nombre").value.trim();
  const precio = Number(document.getElementById("precio").value);
  const stock = Number(document.getElementById("stock").value);

  if (
    !nombre ||
    !Number.isFinite(precio) ||
    precio < 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    mostrarMensaje(mensajeProducto, "Revisá el nombre, el precio y el stock.");
    return;
  }

  const producto = {
    nombre,
    marca: document.getElementById("marca").value,
    categoria: document.getElementById("categoria").value.trim(),
    descripcion: document.getElementById("descripcion").value.trim(),
    precio,
    imagen: document.getElementById("imagen").value.trim(),
    stock,
    activo: document.getElementById("activo").checked,
    updated_at: new Date().toISOString()
  };

  document.getElementById("guardar").disabled = true;
  mostrarMensaje(mensajeProducto, "Guardando...");

  let resultado;

  if (productoEditando !== null) {
    resultado = await supabaseClient
      .from("products")
      .update(producto)
      .eq("id", productoEditando);
  } else {
    resultado = await supabaseClient
      .from("products")
      .insert({
        ...producto,
        user_id: usuarioActual.id
      });
  }

  document.getElementById("guardar").disabled = false;

  if (resultado.error) {
    console.error(resultado.error);
    mostrarMensaje(
      mensajeProducto,
      "No se pudo guardar. Revisá las políticas de Supabase y los datos."
    );
    return;
  }

  limpiarFormulario();
  mostrarMensaje(mensajeProducto, "Producto guardado correctamente.");
  await cargarProductosAdmin();
});

async function eliminarProducto(producto) {
  const confirmar = window.confirm(
    '¿Querés eliminar "' + producto.nombre + '"? Esta acción no se puede deshacer.'
  );

  if (!confirmar) return;

  const { error } = await supabaseClient
    .from("products")
    .delete()
    .eq("id", producto.id);

  if (error) {
    console.error(error);
    mostrarMensaje(mensajeProducto, "No se pudo eliminar el producto.");
    return;
  }

  mostrarMensaje(mensajeProducto, "Producto eliminado.");
  await cargarProductosAdmin();
}

async function iniciarPanel() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    mostrarMensaje(mensajeLogin, "No se pudo comprobar la sesión.");
    return;
  }

  if (data.session) {
    await verificarAdmin(data.session.user);
  } else {
    mostrarPanel(false);
  }
}

iniciarPanel();
