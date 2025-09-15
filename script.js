// --- Firebase ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase, ref, push, set, onValue, remove, update
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaOQPlCQ8oBNp1H2I1Frf6dN5lUmzBGN4",
  authDomain: "stok-alat.firebaseapp.com",
  databaseURL: "https://stok-alat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stok-alat",
  storageBucket: "stok-alat.firebasestorage.app",
  messagingSenderId: "725607746091",
  appId: "1:725607746091:web:284c62588307ce7fb4f86e",
  measurementId: "G-BSZY4KFF0C"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- Elemen DOM ---
const loginCard = document.getElementById("loginCard");
const appDiv = document.getElementById("app");

const inputNama = document.getElementById("inputNama");
const inputSpesifikasi = document.getElementById("inputSpesifikasi");
const inputJumlah = document.getElementById("inputJumlah");
const inputSatuan = document.getElementById("inputSatuan");
const inputTanggal = document.getElementById("inputTanggal");
const btnSimpan = document.getElementById("btnSimpan");
const btnResetForm = document.getElementById("btnResetForm");

const tabelStok = document.querySelector("#tabelStok tbody");
const tabelRiwayat = document.querySelector("#tabelRiwayat tbody");

const btnExportStok = document.getElementById("btnExportStok");
const btnExportRiwayat = document.getElementById("btnExportRiwayat");
const searchStok = document.getElementById("searchStok");
const searchBar = document.getElementById("searchBar");
const bulanExport = document.getElementById("bulanExport");

// Modal Edit
const editModal = document.getElementById("editModal");
const editNama = document.getElementById("editNama");
const editSpesifikasi = document.getElementById("editSpesifikasi");
const editJumlah = document.getElementById("editJumlah");
const editSatuan = document.getElementById("editSatuan");
const btnUpdateBarang = document.getElementById("btnUpdateBarang");
const btnCancelEdit = document.getElementById("btnCancelEdit");

let editId = null;

// --- Referensi Database ---
const stokRef = ref(db, "stokAlat");
const riwayatRef = ref(db, "riwayatAlat");

// --- Tambah Data ---
btnSimpan.addEventListener("click", () => {
  const nama = inputNama.value.trim();
  const spesifikasi = inputSpesifikasi.value.trim();
  const jumlah = parseInt(inputJumlah.value) || 0;
  const satuan = inputSatuan.value.trim();
  const tanggal = inputTanggal.value || new Date().toISOString().slice(0, 10);

  if (!nama || !spesifikasi || !jumlah || !satuan) {
    alert("Lengkapi semua kolom!");
    return;
  }

  const stokId = push(stokRef).key;

  set(ref(db, "stokAlat/" + stokId), {
    id: stokId,
    nama,
    spesifikasi,
    jumlah,
    satuan
  });

  const riwayatId = push(riwayatRef).key;
  set(ref(db, "riwayatAlat/" + riwayatId), {
    id: riwayatId,
    tanggal,
    nama,
    spesifikasi,
    perubahan: jumlah,
    sisa: jumlah,
    satuan
  });

  resetForm();
});

// --- Reset Form ---
function resetForm() {
  inputNama.value = "";
  inputSpesifikasi.value = "";
  inputJumlah.value = "";
  inputSatuan.value = "";
  inputTanggal.value = "";
}
btnResetForm.addEventListener("click", resetForm);

// --- Render Stok ---
onValue(stokRef, (snapshot) => {
  tabelStok.innerHTML = "";
  snapshot.forEach((child) => {
    const data = child.val();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.nama}</td>
      <td>${data.spesifikasi}</td>
      <td>${data.jumlah}</td>
      <td>${data.satuan}</td>
      <td>
        <button class="smallBtn editBtn" data-id="${data.id}">Edit</button>
        <button class="smallBtn secondary deleteBtn" data-id="${data.id}">Hapus</button>
      </td>
    `;
    tabelStok.appendChild(tr);
  });
});

// --- Render Riwayat ---
onValue(riwayatRef, (snapshot) => {
  tabelRiwayat.innerHTML = "";
  let no = 1;
  snapshot.forEach((child) => {
    const data = child.val();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${no++}</td>
      <td>${data.tanggal}</td>
      <td>${data.nama}</td>
      <td>${data.spesifikasi}</td>
      <td>${data.perubahan}</td>
      <td>${data.sisa}</td>
      <td>${data.satuan}</td>
      <td><button class="smallBtn secondary deleteRiwayatBtn" data-id="${data.id}">Hapus</button></td>
    `;
    tabelRiwayat.appendChild(tr);
  });
});

// --- Edit Barang ---
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("editBtn")) {
    editId = e.target.dataset.id;
    const row = e.target.closest("tr").children;
    editNama.value = row[0].textContent;
    editSpesifikasi.value = row[1].textContent;
    editJumlah.value = row[2].textContent;
    editSatuan.value = row[3].textContent;
    editModal.style.display = "block";
  }

  if (e.target.classList.contains("deleteBtn")) {
    const id = e.target.dataset.id;
    remove(ref(db, "stokAlat/" + id));
  }

  if (e.target.classList.contains("deleteRiwayatBtn")) {
    const id = e.target.dataset.id;
    remove(ref(db, "riwayatAlat/" + id));
  }
});

// --- Update Barang ---
btnUpdateBarang.addEventListener("click", () => {
  if (!editId) return;

  update(ref(db, "stokAlat/" + editId), {
    nama: editNama.value,
    spesifikasi: editSpesifikasi.value,
    jumlah: parseInt(editJumlah.value) || 0,
    satuan: editSatuan.value
  });

  editId = null;
  editModal.style.display = "none";
});
btnCancelEdit.addEventListener("click", () => {
  editModal.style.display = "none";
});

// --- Export Stok ke Excel ---
btnExportStok.addEventListener("click", () => {
  exportTableToExcel("tabelStok", "stok_alat");
});

// --- Export Riwayat Bulanan ---
btnExportRiwayat.addEventListener("click", () => {
  const bulan = bulanExport.value;
  if (!bulan) {
    alert("Pilih bulan terlebih dahulu!");
    return;
  }

  const table = document.getElementById("tabelRiwayat");
  const wb = XLSX.utils.table_to_book(table, { sheet: "Riwayat" });
  XLSX.writeFile(wb, `riwayat_alat_${bulan}.xlsx`);
});

// --- Fungsi Export ---
function exportTableToExcel(tableId, filename) {
  const table = document.getElementById(tableId);
  const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
  XLSX.writeFile(wb, filename + ".xlsx");
}

// --- Pencarian ---
searchStok.addEventListener("keyup", () => {
  filterTable("tabelStok", searchStok.value);
});
searchBar.addEventListener("keyup", () => {
  filterTable("tabelRiwayat", searchBar.value);
});

function filterTable(tableId, query) {
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  rows.forEach((row) => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(query.toLowerCase()) ? "" : "none";
  });
}
