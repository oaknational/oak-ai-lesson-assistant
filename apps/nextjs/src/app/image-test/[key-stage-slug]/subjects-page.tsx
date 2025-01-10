"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Import usePathname

const SubjectsPage = ({ subjects }: { subjects: string[] }) => {
  const pathname = usePathname(); // Get the current pathname
  const keystageFromUrl = pathname.split("/").pop(); // Extracts 'key-stage-3' from the URL

  return (
    <div className="mx-auto max-w-[1200px] p-19">
      <div className="mb-11">
        <Link href="/image-test">{`<- Back`}</Link>
      </div>
      <h1 className="mb-11">Choose your keystage: {keystageFromUrl}</h1>
      <div>
        {subjects ? (
          subjects?.map((subject) => (
            <div key={subject} className="mb-5">
              <Link
                href={`/image-test/${keystageFromUrl}/${subject}`}
                className="text-blue hover:underline"
              >
                {subject}
              </Link>
            </div>
          ))
        ) : (
          <p>No subjects found</p>
        )}
      </div>
    </div>
  );
};

export default SubjectsPage;
