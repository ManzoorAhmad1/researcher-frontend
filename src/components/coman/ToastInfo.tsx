import toast from "react-hot-toast";
import { BsInfoCircle } from "react-icons/bs";

const ToastInfo = (message: string) =>
  toast(
    <div style={{ display: "flex", alignItems: "center" }}>
      <BsInfoCircle className="text-[#17a2b8] me-[8px] text-xl" />
      <span>{message}</span>
    </div>
  );
export default ToastInfo;
