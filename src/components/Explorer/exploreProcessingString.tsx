const getRandomBgColor = () => {
    const colors = [
        'bg-red-600', 'bg-pink-700', 'bg-gray-700', 'bg-green-700',
        'bg-blue-700', 'bg-purple-700', 'bg-teal-700', 'bg-orange-700',
        'bg-yellow-700', 'bg-indigo-700'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};
const processString = (input: string) => {
    const words = input.split(' ');
    let result = '';
    words.forEach((word, index) => {
        if (index < 2)
            result += word.slice(0, 1);
    });
    return result.toUpperCase();
};
const convertIntoDiv: any = (text: string, length = 0, parent = false) => {
    return (
        <div className='text-sm flex gap-1 items-center justify-between max-w-[200px]'>
            <div className='flex gap-1 items-center title truncate w-[200px]'>
                <span className={`flex items-center justify-center rounded text-center text-white text-xs py-0.5 px-2 ${getRandomBgColor()} h-[25px] w-[32px]`}>
                    {processString(text)}
                </span>
                <span className="truncate">{text}</span>
            </div>
            {
                parent &&
                <div className="text-right text-sky-700 font-medium text-xs">{length}</div>
            }
        </div>
    );
}
export default convertIntoDiv