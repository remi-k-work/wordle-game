// components
import { Toast } from "@base-ui/react/toast";
import { ToastItem } from "./toast-item";

export function ToastList() {
  const { toasts } = Toast.useToastManager();

  return toasts.map((toast) => <ToastItem key={toast.id} toast={toast} />);
}
