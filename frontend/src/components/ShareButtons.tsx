import {
  Box,
  IconButton,
  Tooltip,
  useClipboard,
  useToast,
  HStack,
} from "@chakra-ui/react";
import { FaFacebook, FaTwitter, FaLine, FaLink } from "react-icons/fa";

export interface ShareButtonsProps {
  /** Title to be shared (usually dog name or breed) */
  title: string;
  /** Description to be shared (usually a summary of the dog's details) */
  description: string;
  /** URL of the current page to be shared */
  url: string;
}

/**
 * Component that provides buttons to share content on various social media platforms
 */
export const ShareButtons = ({
  title,
  description,
  url,
}: ShareButtonsProps) => {
  const { onCopy, hasCopied } = useClipboard(url);
  const toast = useToast();

  // Handler for native share API (mobile devices)
  const handleNativeShare = async () => {
    if (navigator && "share" in navigator) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        toast({
          title: "แชร์สำเร็จ",
          status: "success",
          duration: 2000,
        });
      } catch (error) {
        console.error("Error sharing", error);
      }
    }
  };

  // Handler for Facebook sharing
  const handleFacebookShare = () => {
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}&quote=${encodeURIComponent(description)}`;
    window.open(fbShareUrl, "_blank", "width=600,height=400");
  };

  // Handler for Twitter sharing
  const handleTwitterShare = () => {
    const tweetText = `${title} - ${description}`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&url=${encodeURIComponent(url)}`;
    window.open(twitterShareUrl, "_blank", "width=600,height=400");
  };

  // Handler for LINE sharing
  const handleLineShare = () => {
    const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(`${title} - ${description}`)}`;
    window.open(lineShareUrl, "_blank", "width=600,height=600");
  };

  // Handler for copying link
  const handleCopyLink = () => {
    onCopy();
    toast({
      title: "คัดลอกลิงก์แล้ว",
      status: "success",
      duration: 2000,
    });
  };

  return (
    <Box>
      {/* Try native share API first for mobile devices */}
      {navigator && "share" in navigator ? (
        <IconButton
          aria-label="Share this dog"
          icon={<FaLink />}
          onClick={handleNativeShare}
          colorScheme="blue"
          size="md"
          isRound
        />
      ) : (
        <HStack spacing={2}>
          <Tooltip label="แชร์ไปยัง Facebook">
            <IconButton
              aria-label="Share on Facebook"
              icon={<FaFacebook />}
              onClick={handleFacebookShare}
              colorScheme="facebook"
              size="md"
              isRound
            />
          </Tooltip>

          <Tooltip label="แชร์ไปยัง LINE">
            <IconButton
              aria-label="Share on LINE"
              icon={<FaLine />}
              onClick={handleLineShare}
              colorScheme="green"
              size="md"
              isRound
            />
          </Tooltip>

          <Tooltip label="แชร์ไปยัง Twitter">
            <IconButton
              aria-label="Share on Twitter"
              icon={<FaTwitter />}
              onClick={handleTwitterShare}
              colorScheme="twitter"
              size="md"
              isRound
            />
          </Tooltip>

          <Tooltip label={hasCopied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}>
            <IconButton
              aria-label="Copy link"
              icon={<FaLink />}
              onClick={handleCopyLink}
              colorScheme="gray"
              size="md"
              isRound
            />
          </Tooltip>
        </HStack>
      )}
    </Box>
  );
};

export default ShareButtons;
