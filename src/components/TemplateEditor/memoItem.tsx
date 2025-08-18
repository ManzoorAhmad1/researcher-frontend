import React, { memo, useRef, useEffect, useState } from 'react';
import { Handle, Position, NodeToolbar, } from '@xyflow/react';
import { TextareaBorder } from "@/components/ui/TextareaBorder";
import { Button } from '@/components/ui/button';

const PromptComponent = ({ data, isConnectable }: any) => {
  const textAreaRef = useRef<HTMLTextAreaElement | null | any>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  useEffect(() => { 
    resizeTextArea();
    if (cursorPosition !== null && textAreaRef.current) {
      textAreaRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [data.promptQuestions, cursorPosition]);

  const resizeTextArea = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.target.selectionStart);
    data.onChange(e.target.value, data);
  };




  return (
    <> 
    {/* --------- nex commented line is important for the future---------- */}
      {/* <NodeToolbar isVisible={data.showToolBox} position={Position.Bottom}>
        <div className="flex items-center">
          <Button className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] p-3 py-1 hover:text-[#0E70FF]" type="button" onClick={() => { data.addAction(data) }} variant="outline"> Add Action</Button>
        </div>

      </NodeToolbar>
      <div style={{ backgroundColor: "#DEE6F1" }} id="add-question" > */}

      <NodeToolbar isVisible={data.showToolBox} position={Position.Bottom}>
        <div id="save-template-btn" style={{fontFamily: '__Poppins_6bee3b'}} className="button-full cursor-pointer select-none text-nowrap flex items-center gap-1 bg-blue-600 text-white px-2 py-4 rounded-full hover:bg-blue-700 transition-colors mr-2"
          onClick={() => { data.addAction(data) }}
        >Add Action</div>
      </NodeToolbar>
      <div style={{ backgroundColor: "#dee6f1" }} id="add-question" >
        {data.id !== 1 && (
          <Handle
            type="target"
            position={Position.Top}
            style={{ background: '#555',fontFamily: '__Poppins_6bee3b' }}
            onConnect={(params) => console.log('handle onConnect', params)}
            isConnectable={isConnectable}
          />
        )}
        <div className="dark:text-[#1a2a2e]">Prompt Text {data.changed.includes(data.id) ?
          <span className="text-xs italic text-gray-400 font-semibold">
            {"(Unsaved changes)"}
          </span>
          : ''}</div>
        <div className="sectionScroll max-h-[400px] overflow-y-auto">
          <TextareaBorder
            ref={textAreaRef}
            className="h-8 mt-2 mb-2 w-[350px] overflow-y-hidden dark:bg-[white] dark:text-[#1a2a2e]"
            placeholder="Enter your question"
            value={data.promptQuestions}
            onChange={handleChange}
            style={{fontFamily: '__Poppins_6bee3b'}}
          />
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          id="b"
          style={{ bottom: 0, top: 'auto', background: '#555' }}
          isConnectable={isConnectable}
        />
      </div>
    </>
  );
};

PromptComponent.displayName = 'PromptComponent';

export default memo(PromptComponent);
