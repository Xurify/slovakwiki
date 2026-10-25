export type AudioMountTarget = {
  key: string;
  props: {
    class?: string;
    label?: string;
    size?: "xs" | "sm" | "md" | "lg";
    src?: string;
    text: string;
    variant?: "default" | "inverse";
  };
};
