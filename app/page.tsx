'use client'

import Image from "next/image";

export default function Home() {
  return (
    <div>
      Hello
      <button onClick={() => console.log("Button pressed")}>Button</button>
    </div>
  );
}
