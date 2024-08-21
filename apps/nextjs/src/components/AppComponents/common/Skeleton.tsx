import { Box, Flex } from "@radix-ui/themes";
import { cva } from "class-variance-authority";

type SkeletonProps = {
  children: React.ReactNode;
  loaded: boolean;
  numberOfRows?: 1 | 2;
};

const Skeleton = ({
  children,
  loaded,
  numberOfRows,
}: Readonly<SkeletonProps>) => {
  return (
    <Flex direction="column">
      <Box className={skeletonStyles({ loaded })}>
        <span className={skeletonTextStyles({ loaded })}>{children}</span>
      </Box>

      {numberOfRows == 2 && !loaded && (
        <Box className={skeletonStyles({ loaded })} />
      )}
    </Flex>
  );
};

const skeletonStyles = cva("duration-600 mb-12 min-h-[50px]", {
  variants: {
    loaded: {
      true: "background-transparent",
      false: "animate-[wiggle_2s_ease-in-out_infinite] rounded opacity-60",
    },
  },
});

const skeletonTextStyles = cva("delay-75 duration-150", {
  variants: {
    loaded: {
      true: "opacity-100",
      false: "hidden opacity-0",
    },
  },
});
export default Skeleton;
