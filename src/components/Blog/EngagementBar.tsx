"use client";
;
import { useState, useEffect } from 'react';
import { useColorModeValue } from "../ui/color-mode";
import { Steps, HStack, IconButton } from "@chakra-ui/react";
import { Tooltip } from '@/components/ui/tooltip';
import {
  FaArrowUp,
  FaArrowDown,
  FaShare,
  FaBookmark,
  FaRegBookmark,
} from 'react-icons/fa';

interface EngagementBarProps {
  slug: string;
  userId?: string;
  commentCount?: number;
}

export default function EngagementBar({ 
  slug, 
  userId, 
  commentCount = 0 
}: EngagementBarProps) {
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const upvoteColor = useColorModeValue('green.500', 'green.400');
  const downvoteColor = useColorModeValue('red.500', 'red.400');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    trackView();
  }, [slug]);

  const trackView = async () => {
    try {
      await fetch(`/api/blogs/${slug}/engagement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'view', user_id: userId || null }),
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/blogs/${slug}/engagement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: voteType, user_id: userId || null }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (voteType === 'upvote') {
          setHasUpvoted(data.upvoted);
          setHasDownvoted(false);
        } else {
          setHasDownvoted(data.downvoted);
          setHasUpvoted(false);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <HStack gap={2} justify="flex-start" py={2}>
      {/* Upvote */}
      <Tooltip content="Upvote" positioning={{
        placement: "top"
      }}>
        <IconButton
          aria-label="Upvote"
          size="sm"
          variant={hasUpvoted ? 'solid' : 'outline'}
          colorPalette={hasUpvoted ? 'green' : 'gray'}
          onClick={() => handleVote('upvote')}
          loading={isLoading}
          _hover={{ bg: hasUpvoted ? upvoteColor : hoverBg }}><FaArrowUp /></IconButton>
      </Tooltip>
      {/* Downvote */}
      <Tooltip content="Downvote" positioning={{
        placement: "top"
      }}>
        <IconButton
          aria-label="Downvote"
          size="sm"
          variant={hasDownvoted ? 'solid' : 'outline'}
          colorPalette={hasDownvoted ? 'red' : 'gray'}
          onClick={() => handleVote('downvote')}
          loading={isLoading}
          _hover={{ bg: hasDownvoted ? downvoteColor : hoverBg }}><FaArrowDown /></IconButton>
      </Tooltip>
      {/* Save */}
      <Tooltip content={isBookmarked ? 'Saved' : 'Save'} positioning={{
        placement: "top"
      }}>
        <IconButton
          aria-label="Save"
          size="sm"
          variant="outline"
          colorPalette={isBookmarked ? 'blue' : 'gray'}
          onClick={() => setIsBookmarked(!isBookmarked)}
          _hover={{ bg: hoverBg }}>{isBookmarked ? <FaBookmark /> : <FaRegBookmark />}</IconButton>
      </Tooltip>
      {/* Share */}
      <Tooltip content="Share" positioning={{
        placement: "top"
      }}>
        <IconButton
          aria-label="Share"
          size="sm"
          variant="outline"
          colorPalette="gray"
          onClick={handleShare}
          _hover={{ bg: hoverBg }}><FaShare /></IconButton>
      </Tooltip>
    </HStack>
  );
}
