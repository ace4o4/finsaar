/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance as TippyInstance } from "tippy.js";
import { 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Image as ImageIcon, 
  Table as TableIcon 
} from "lucide-react";

// --- React Component for the Dropdown Menu ---
export const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useEffect(() => {
    if (containerRef.current) {
      const selectedEl = containerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl && typeof selectedEl.scrollIntoView === 'function') {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }
      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }
      if (event.key === "Enter") {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <div ref={containerRef} className="bg-white border border-[#E7E4DC] shadow-2xl rounded-xl p-1.5 flex flex-col gap-0.5 min-w-[220px] max-h-[300px] overflow-y-auto z-[9999]">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            key={index}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left w-full ${
              index === selectedIndex ? "bg-sand/50 text-navy" : "text-[#14213A] hover:bg-sand/30"
            }`}
            onClick={() => selectItem(index)}
          >
            <div className="text-[#7A7F8C]">{item.icon}</div>
            <div>
               <div className="font-semibold">{item.title}</div>
               {item.description && <div className="text-[10px] text-[#7A7F8C] mt-0.5">{item.description}</div>}
            </div>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-[#7A7F8C]">No results</div>
      )}
    </div>
  );
});

CommandList.displayName = "CommandList";


// --- Suggestion Items Configuration ---
const getSuggestionItems = ({ query }: { query: string }) => {
  const items = [
    { 
      title: "Heading 2", 
      description: "Large section heading", 
      icon: <Heading2 size={16} />, 
      command: ({ editor, range }: any) => { editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(); } 
    },
    { 
      title: "Heading 3", 
      description: "Medium section heading", 
      icon: <Heading3 size={16} />, 
      command: ({ editor, range }: any) => { editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(); } 
    },
    { 
      title: "Bullet List", 
      description: "Create a simple bulleted list", 
      icon: <List size={16} />, 
      command: ({ editor, range }: any) => { editor.chain().focus().deleteRange(range).toggleBulletList().run(); } 
    },
    { 
      title: "Numbered List", 
      description: "Create a list with numbering", 
      icon: <ListOrdered size={16} />, 
      command: ({ editor, range }: any) => { editor.chain().focus().deleteRange(range).toggleOrderedList().run(); } 
    },
    { 
      title: "Quote", 
      description: "Capture a blockquote", 
      icon: <Quote size={16} />, 
      command: ({ editor, range }: any) => { editor.chain().focus().deleteRange(range).toggleBlockquote().run(); } 
    },
    { 
      title: "Code", 
      description: "Insert a code snippet block", 
      icon: <Code size={16} />, 
      command: ({ editor, range }: any) => { editor.chain().focus().deleteRange(range).toggleCodeBlock().run(); } 
    },
    { 
      title: "Table", 
      description: "Insert a 2x2 table", 
      icon: <TableIcon size={16} />, 
      command: ({ editor, range }: any) => { editor.chain().focus().deleteRange(range).insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run(); } 
    },
    { 
      title: "Image", 
      description: "Upload an image from device", 
      icon: <ImageIcon size={16} />, 
      command: ({ editor, range }: any) => { 
        editor.chain().focus().deleteRange(range).run();
        // Trigger the hidden file input in RichEditor
        document.getElementById("rich-editor-inline-image")?.click();
      } 
    },
  ];

  return items.filter(item => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10);
};


// --- Tippy / ReactRenderer configuration ---
const renderItems = () => {
  let component: ReactRenderer;
  let popup: TippyInstance[];

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },
    onUpdate: (props: any) => {
      component.updateProps(props);
      if (!props.clientRect) {
        return;
      }
      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },
    onKeyDown: (props: any) => {
      if (props.event.key === "Escape") {
        popup[0].hide();
        return true;
      }
      return component.ref?.onKeyDown(props);
    },
    onExit: () => {
      popup[0].destroy();
      component.destroy();
    },
  };
};


// --- The actual Tiptap Extension ---
export const SlashCommand = Extension.create({
  name: "slashCommand",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        items: getSuggestionItems,
        render: renderItems,
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range, props });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
