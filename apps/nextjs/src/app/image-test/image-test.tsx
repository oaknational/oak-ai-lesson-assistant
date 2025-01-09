"use client";

import Link from "next/link";

const ImageTest = ({ keyStages }: { keyStages: string[] }) => {
  return (
    <div className="mx-auto max-w-[1200px] p-19">
      <h1 className="mb-11">Choose your keystage</h1>
      <div>
        {keyStages?.map((keyStage) => (
          <div key={keyStage} className="mb-5">
            <Link
              href={`/image-test/${keyStage}`}
              className="text-blue hover:underline"
            >
              {keyStage}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageTest;
