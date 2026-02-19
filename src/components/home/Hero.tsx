import { FC } from "react";

const HeroSection: FC = () => {
  return (
    <section>
      <h3 className="text-lg font-semibold">
        You have a <span className="text-primary">SECRET</span>?
        <br /> Sell at your desired price.
      </h3>
      <p className="text-xs mt-2">
        Blockchain powered string selling marketplace.
      </p>
    </section>
  );
};

export default HeroSection;
