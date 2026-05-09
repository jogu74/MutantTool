"use client";

import type React from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster(props: ToasterProps) {
  return <Sonner theme="light" toastOptions={{ className: "font-sans" }} {...props} />;
}

export { Toaster };
