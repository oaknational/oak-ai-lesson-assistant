interface ChatLayoutProps {
  children: React.ReactNode;
}

export default async function ChatLayout({
  children,
}: Readonly<ChatLayoutProps>) {
  return (
    <div className="relative flex h-full overflow-hidden">
      <div className="group w-full overflow-auto pl-0 duration-300 ease-in-out animate-in peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
        {children}
      </div>
    </div>
  );
}
