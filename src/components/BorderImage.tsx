import { Steps, Box, Image as ChakraImage, ImageProps, BoxProps } from "@chakra-ui/react";

import { useColorModeValue } from "./ui/color-mode";

type BorderedImageProps = {
  src: string;
  alt?: string;
} & BoxProps; // or ImageProps if you want to pass to the image itself

export default function BorderedImage({ src, alt, ...props }: BorderedImageProps) {
  const borderColor = useColorModeValue('teal.400', 'teal.600');
  return (
    <Box borderWidth="2px" borderColor={borderColor} borderRadius="xl" {...props}>
      <ChakraImage src={src} alt={alt ?? ''} width="100%" objectFit="cover" />
    </Box>
  );
}
