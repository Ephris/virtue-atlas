import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import ChatConsole from "./ChatConsole";

const MobileChatSheet = () => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-4 right-4 z-[1000] h-14 w-14 rounded-full shadow-lg lg:hidden"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh] max-h-[85vh]">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Intelligence Console</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-hidden">
          <ChatConsole />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileChatSheet;
