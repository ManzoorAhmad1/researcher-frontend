import React from 'react'

const Switch = ({ onChange, value,id }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, value: boolean,id:string }) => {
    return (
        <label htmlFor={id} className="flex items-center cursor-pointer c-switch">
            <div className="relative">
                <input id={id} type="checkbox" checked={value} className="sr-only" onChange={onChange} />
                <div className={`w-10 h-4 ${value ? 'bg-[#CFE1FF]' : 'bg-[#CCCCCC]'} rounded-full shadow-inner`} />
                <div className={`dot absolute w-6 h-6 ${value ? 'bg-[#0E70FF]' : 'bg-[#E5E5E5]'} rounded-full shadow-2xl  -left-0 -top-1 transition`} />
            </div>
        </label>
    )
}

export default Switch