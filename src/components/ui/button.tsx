import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { AiOutlineLoading } from "react-icons/ai";
import { cn } from '@/lib/utils'

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive:
					'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline:
					'border border-input bg-secondaryBackground hover:bg-accent hover:text-accent-foreground',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button'
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		)
	}
)
Button.displayName = 'Button'

const RoundButton = React.forwardRef<HTMLButtonElement, ButtonProps & { loading?: boolean }>(
	({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
	  const Comp = asChild ? Slot : 'button';
 
	  return (
		 <Comp
			className={cn(
			  buttonVariants({ variant, size }),
			  className,
			  "btn text-white rounded-full font-size-large"
			)}
			ref={ref}
			onMouseDown={(e) =>
			  (e.currentTarget.style.background =
				 "linear-gradient(0deg, #0e70ff 107.89%, #0f55ba -32.81%)")
			}
			onMouseUp={(e) =>
			  (e.currentTarget.style.background =
				 "linear-gradient(0deg, #0f55ba -32.81%, #0e70ff 107.89%)")
			}
			{...props}
		 >
			{loading ? (
			  <AiOutlineLoading className="animate-spin" size={20} />
			) : (
			  children || "Save Changes"
			)}
		 </Comp>
	  );
	}
 );
 
 RoundButton.displayName = 'RoundButton';

interface LightThemeButtonProps {
	onClick: () => void; 
	children: React.ReactNode;
	style?:Object,
	id?:string,
 }

const DarkThemeButton: React.FC<LightThemeButtonProps> = ({ onClick, children,style,id, ...props }) => {
  return (
    <div
	 { ...props}
      style={{
			...style,
        padding: '4px',
        margin: '4px 0',
		  fontWeight: 500,
        backgroundColor: '#166ef7',
		  width: '100%',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
		  color:'white',
      }}
      onClick={onClick}
		id={id}
    >
        {children}
    </div>
  );
};

const LightThemeButton: React.FC<LightThemeButtonProps> = ({ onClick, children, style,id, ...props }) => {
	return (
		<div
			{...props}
			style={{
				padding: '4px',
				margin: '4px 0',
				backgroundColor: 'white',
				border: '2px solid #e2e8f0',
				width: '100%',
				borderRadius: '4px',
				cursor: 'pointer',
				display: 'flex',
				justifyContent: 'center',
				color: 'black',
				fontWeight: 500,
				...style,
			}}
			onClick={onClick}
			id={id}
		>
			{children}
		</div>
	);
};
 

export { Button, buttonVariants, DarkThemeButton, LightThemeButton, RoundButton }
