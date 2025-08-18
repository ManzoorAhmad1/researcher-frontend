// react-swipy.d.ts
declare module "react-swipy" {
  import React from "react";

  interface SwipeableProps {
    limit?: number;
    onSwipe?: (value: any) => void;
    onAfterSwipe?: () => void;
    children: React.ReactNode;
  }

  const Swipeable: React.FC<SwipeableProps>;

  export default Swipeable;
}
