"use client";
import React from "react";
import Header from "../components/custom/Header";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MessagesContext } from "@/context/MessagesContext";
import { ActionProvider } from "@/context/ActionContext";

const Provider = ({ children }) => {
  const [messages, setMessages] = React.useState();

  return (
    <div>
      <MessagesContext.Provider value={{ messages, setMessages }}>
        <ActionProvider>
          <NextThemesProvider
            attribute="class"
            enableSystem
            defaultTheme="dark"
            disableTransitionOnChange
          >
            <Header />
            {children}
          </NextThemesProvider>
        </ActionProvider>
      </MessagesContext.Provider>
    </div>
  );
};

export default Provider;