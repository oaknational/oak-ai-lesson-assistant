interface ChatLayoutProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: Readonly<ChatLayoutProps>) {
  return (
    <div className="relative flex h-full overflow-hidden">
      <div className="group w-full overflow-auto pl-0 duration-300 ease-in-out animate-in lg:peer-data-[state=open]:pl-[250px] xl:peer-data-[state=open]:pl-[300px]">
        {children}
      </div>
    </div>
  );
}
