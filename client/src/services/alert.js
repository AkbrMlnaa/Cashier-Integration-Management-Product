import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const successAlert = (title, text) => {
  return MySwal.fire({
    icon: "success",
    title: title,
    text: text,
    timer: 1500,
    showConfirmButton: false,
    background: "#fff",
    color: "#000",
    customClass: {
      popup: "custom-swal-popup",
    },
  });
};

export const errorAlert = (title, text) => {
  return MySwal.fire({
    icon: "error",
    title: title,
    text: text,
    confirmButtonText: "Coba lagi",
    confirmButtonColor: "#dc2626",
    background: "#fff",
    color: "#000",
    customClass: {
      popup: "custom-swal-popup",
    },
  });
};

export const confirmAlert = (title, text) => {
  return MySwal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#64748b",
    background: "#fff",
    color: "#000",
    customClass: {
      popup: "custom-swal-popup",
    },
  });
};
export const confirmAlertLogout = (title, text) => {
  return MySwal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#64748b",
    background: "#fff",
    color: "#000",
    customClass: {
      popup: "custom-swal-popup",
    },
  });
};
