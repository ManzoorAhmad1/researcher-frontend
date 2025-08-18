const WrapperBox = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return <div style={{ padding: "1.3rem" }}>{children}</div>;
};
export default WrapperBox;
