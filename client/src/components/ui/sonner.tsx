import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-900/95 group-[.toaster]:text-zinc-100 group-[.toaster]:border-zinc-800/50 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-xl",
          description: "group-[.toast]:text-zinc-400",
          actionButton:
            "group-[.toast]:bg-zinc-800/50 group-[.toast]:text-zinc-100 group-[.toast]:border-zinc-700/50 group-[.toast]:hover:bg-zinc-700/50",
          cancelButton:
            "group-[.toast]:bg-zinc-800/30 group-[.toast]:text-zinc-400 group-[.toast]:border-zinc-700/30 group-[.toast]:hover:bg-zinc-700/30",
          error:
            "group-[.toast]:bg-zinc-900/95 group-[.toast]:text-zinc-100 group-[.toast]:border-zinc-700/50",
          success:
            "group-[.toast]:bg-zinc-900/95 group-[.toast]:text-zinc-100 group-[.toast]:border-zinc-700/50",
          warning:
            "group-[.toast]:bg-zinc-900/95 group-[.toast]:text-zinc-100 group-[.toast]:border-zinc-700/50",
          info: "group-[.toast]:bg-zinc-900/95 group-[.toast]:text-zinc-100 group-[.toast]:border-zinc-700/50",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
