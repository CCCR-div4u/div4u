/**
 * 포유(4U) 캐릭터 이미지 매핑
 */
export const FORU_IMAGES = {
  // 기본 상태
  default: "/images/foru/main.png",
  main: "/images/foru/main.png",
  
  // 로딩 상태 (다녀오는 중)
  loading: "/images/foru/running_4u.png",
  running: "/images/foru/running_4u.png",
  
  // 혼잡도별 감정 상태
  붐빔: "/images/foru/crowd_4.png",
  "매우 붐빔": "/images/foru/crowd_4.png",
  "약간 붐빔": "/images/foru/crowd_3.png", 
  보통: "/images/foru/main.png",
  여유: "/images/foru/crowd_1.png",
  정보없음: "/images/foru/none.png",
  
  // 영문 매핑 (필요시)
  busy: "/images/foru/crowd_4.png",
  crowded: "/images/foru/crowd_4.png",
  normal: "/images/foru/main.png",
  free: "/images/foru/crowd_1.png",
  noinfo: "/images/foru/none.png"
} as const;

/**
 * 혼잡도 레벨에 따른 포유 이미지 가져오기
 */
export const getForuImageByCongestionLevel = (level: string): string => {
  return FORU_IMAGES[level as keyof typeof FORU_IMAGES] || FORU_IMAGES.default;
};

/**
 * 포유 캐릭터 상태별 메시지
 */
export const FORU_MESSAGES = {
  greeting: "안녕하세요! 저는 포유예요 🐿️\n서울 어디든 직접 다녀와서 실시간 혼잡도를 알려드릴게요!",
  loading: "혼잡도 확인하러 다녀오고 있어요...! 🏃‍♀️💨",
  noLocation: "어디로 가야 할지 잘 모르겠어요... 😅\n구체적인 장소명을 알려주시면 그곳으로 다녀올게요!",
  error: "앗! 혼잡도 정보를 가져오는 중에 문제가 생겼어요... 😅\n잠시 후에 다시 시도해주세요!",
  
  // 혼잡도별 메시지
  여유: "와아~ 정말 한적하고 좋아요! 지금이 다니기 딱 좋은 시간이에요!",
  보통: "평소와 비슷한 수준이에요! 이동하기엔 딱 적당해요~",
  "약간 붐빔": "음... 조금 붐비긴 하지만 견딜 만해요!",
  붐빔: "우와... 꽤 붐비고 있어요! 시간 여유를 두고 이동하세요!",
  "매우 붐빔": "헉! 정말 많이 붐비고 있어요! 조금 후에 가시는 게 좋을 것 같아요!",
  정보없음: "앗... 혼잡도 정보를 확인할 수 없었어요."
} as const;

/**
 * 혼잡도 레벨에 따른 포유 메시지 가져오기
 */
export const getForuMessageByCongestionLevel = (level: string): string => {
  return FORU_MESSAGES[level as keyof typeof FORU_MESSAGES] || FORU_MESSAGES.정보없음;
};