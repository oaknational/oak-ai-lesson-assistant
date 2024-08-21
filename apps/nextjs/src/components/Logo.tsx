type LogoProps = {
  width?: number;
  height?: number;
};
export const Logo = ({ width = 105, height = 48 }: Readonly<LogoProps>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 104 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M94.3459 36.9406C93.9645 36.7151 93.4857 36.6024 92.9094 36.6024C92.6591 36.6025 92.4103 36.6386 92.1705 36.7097C91.9172 36.7837 91.6738 36.8879 91.4458 37.02C91.2181 37.1499 91.0074 37.3071 90.8185 37.4881C90.6719 37.6325 90.5435 37.794 90.4361 37.9691C90.3463 37.7406 90.2213 37.5273 90.0656 37.3367C89.858 37.0877 89.5895 36.8955 89.2856 36.7784C88.9563 36.6551 88.6064 36.5943 88.2543 36.5991C87.9988 36.5997 87.7448 36.6391 87.5014 36.7162C87.2497 36.7943 87.0085 36.9024 86.7832 37.0383C86.5607 37.1715 86.361 37.3389 86.1917 37.5343C86.1451 37.588 86.1082 37.647 86.0671 37.7028L86.0378 36.7366H84.1279V44.0319H86.1072V39.6644C86.1062 39.4789 86.1469 39.2955 86.2263 39.1276C86.3037 38.9669 86.4098 38.8214 86.5394 38.6981C86.6736 38.5711 86.8325 38.4724 87.0063 38.4082C87.1955 38.3367 87.3964 38.3003 87.5989 38.3009C87.827 38.2938 88.0524 38.3512 88.2489 38.4662C88.4322 38.5849 88.5752 38.7555 88.6595 38.9558C88.763 39.2025 88.8128 39.4681 88.8057 39.7352V44.0373H90.785V39.6773C90.7813 39.4878 90.8182 39.2997 90.8933 39.1254C90.9669 38.9625 91.0734 38.8164 91.2064 38.696C91.3436 38.5697 91.5045 38.4712 91.6798 38.4061C91.869 38.3346 92.0699 38.2982 92.2724 38.2987C92.5105 38.2888 92.7468 38.3433 92.9559 38.4565C93.1377 38.5696 93.279 38.7363 93.36 38.9332C93.4619 39.1919 93.5095 39.4685 93.4998 39.746V44.0351H95.479V39.6085C95.4944 39.0438 95.3972 38.4816 95.193 37.9541C95.0271 37.5323 94.7261 37.1762 94.3361 36.9406"
        fill="#222222"
      />
      <path
        d="M54.5376 38.567C54.8418 38.3848 55.1919 38.2917 55.5472 38.2986C55.7875 38.2982 56.0259 38.34 56.2514 38.4221C56.4782 38.5042 56.692 38.6181 56.8862 38.7603C57.072 38.8936 57.2364 39.0539 57.3737 39.2359L58.4571 37.94C58.128 37.5001 57.6847 37.1569 57.1744 36.9469C56.6023 36.7028 55.9848 36.5806 55.362 36.5883C54.7062 36.5757 54.0596 36.7421 53.4929 37.0693C52.9261 37.3965 52.4612 37.872 52.1489 38.4436C51.8336 39.0429 51.6689 39.7088 51.6689 40.3847C51.6689 41.0606 51.8336 41.7265 52.1489 42.3258C52.4635 42.8949 52.9292 43.3679 53.4955 43.6936C54.0619 44.0193 54.7073 44.1852 55.362 44.1735C55.9732 44.1758 56.5779 44.05 57.1365 43.8042C57.6462 43.5961 58.0964 43.2668 58.4473 42.8455L57.3737 41.5496C57.2216 41.7369 57.0458 41.904 56.8505 42.0467C56.6663 42.181 56.462 42.2857 56.2449 42.357C56.0242 42.4281 55.7935 42.4644 55.5613 42.4643C55.2062 42.4691 54.8574 42.3705 54.5582 42.1809C54.2637 41.996 54.0214 41.74 53.854 41.4369C53.6779 41.1129 53.5891 40.7494 53.5962 40.3815C53.589 40.0085 53.6754 39.6396 53.8475 39.3078C54.0057 39.0044 54.2443 38.7495 54.5376 38.5702"
        fill="#222222"
      />
      <path
        d="M101.742 36.7397L100.195 41.0429C100.126 41.2576 100.056 41.4584 99.9871 41.6495C99.9698 41.5969 99.9557 41.5421 99.9373 41.4906C99.876 41.305 99.8036 41.1233 99.7206 40.9462L97.9234 36.7397H95.6787L99.0089 44.0072L97.6298 47.2066H99.6372L100.906 44.0351L103.999 36.7397H101.742Z"
        fill="#222222"
      />
      <path
        d="M81.2491 39.6224H77.8605C77.8941 39.4703 77.9446 39.3223 78.0111 39.1811C78.1486 38.889 78.3762 38.6476 78.661 38.4919C78.9813 38.3265 79.339 38.2455 79.7 38.2567C79.9623 38.2522 80.2221 38.3089 80.4583 38.4221C80.6784 38.5304 80.8676 38.6917 81.0086 38.8913C81.1514 39.0901 81.2358 39.3242 81.2524 39.5677L81.2491 39.6224ZM82.1764 37.6158C81.8645 37.2892 81.487 37.031 81.0682 36.8578C80.6267 36.6751 80.1523 36.5835 79.674 36.5883C79.1607 36.5838 78.6515 36.6798 78.1757 36.8707C77.7266 37.0521 77.3207 37.3246 76.9841 37.6705C76.6451 38.0225 76.3797 38.4374 76.203 38.8913C76.0131 39.3844 75.9187 39.9085 75.9246 40.4362C75.911 41.1137 76.0844 41.7819 76.4261 42.3688C76.7598 42.9282 77.2421 43.3861 77.8204 43.6926C78.7798 44.1717 79.8796 44.298 80.9241 44.049C81.2713 43.9652 81.6078 43.8428 81.9273 43.684C82.2507 43.5246 82.551 43.3228 82.8199 43.0838L81.872 41.774C81.6132 41.9934 81.3206 42.1703 81.0054 42.2979C80.7199 42.4016 80.4178 42.4529 80.1138 42.4493C79.6865 42.4601 79.263 42.3676 78.8799 42.1798C78.5431 42.0116 78.2625 41.7507 78.0717 41.4283C77.9624 41.2399 77.8851 41.035 77.8431 40.8217H83.0962L83.1103 40.2151C83.134 39.7227 83.0581 39.2307 82.8871 38.7678C82.7288 38.3398 82.4849 37.948 82.1699 37.6158"
        fill="#222222"
      />
      <path
        d="M45.6586 40.3397L46.2154 38.8774C46.2876 38.6627 46.3667 38.4479 46.4527 38.2332C46.5386 38.0185 46.6173 37.7909 46.6888 37.5504C46.7625 37.3174 46.834 37.0898 46.9055 36.8654C46.9748 37.0801 47.0463 37.3077 47.1222 37.5429C47.2052 37.8005 47.2865 38.0443 47.3659 38.274C47.4453 38.5038 47.5129 38.6924 47.5685 38.8398L48.1372 40.3429L45.6586 40.3397ZM46.0063 34.3821L42.1865 44.0351H44.2503L45.0227 42.0081H48.7666L49.5326 44.0351H51.6797L47.874 34.3821H46.0063Z"
        fill="#222222"
      />
      <path
        d="M64.1111 41.4768C63.9704 41.7797 63.7448 42.0361 63.4611 42.2154C63.1682 42.3937 62.8298 42.4847 62.4861 42.4774C62.1494 42.4837 61.8181 42.3927 61.5328 42.2154C61.2517 42.0331 61.0268 41.7776 60.8828 41.4768C60.7185 41.1306 60.6377 40.7513 60.6466 40.3688C60.6377 39.9918 60.7187 39.6181 60.8828 39.278C61.0295 38.979 61.2539 38.7241 61.5328 38.5393C61.8173 38.3578 62.15 38.2643 62.4883 38.2709C62.8328 38.2637 63.1719 38.357 63.4633 38.5393C63.7448 38.7211 63.9698 38.9768 64.1133 39.278C64.2719 39.6197 64.3498 39.9928 64.3408 40.3688C64.3491 40.7509 64.2706 41.1299 64.1111 41.4779V41.4768ZM64.3126 37.7094C64.1713 37.5131 64.0049 37.3359 63.8175 37.1822C63.58 36.9945 63.3113 36.8492 63.0234 36.7528C62.7029 36.6436 62.3657 36.5899 62.0268 36.5939C61.4191 36.5843 60.8223 36.7548 60.313 37.0835C59.8038 37.4176 59.3927 37.8791 59.1213 38.4212C58.819 39.026 58.6682 39.694 58.6815 40.3688C58.6686 41.0459 58.8171 41.7165 59.1148 42.326C59.3799 42.8699 59.7835 43.3358 60.2859 43.6777C60.7744 44.0077 61.3533 44.1812 61.9445 44.1748C62.2761 44.1763 62.6057 44.1226 62.9194 44.0159C63.216 43.9151 63.4954 43.7703 63.7482 43.5865C63.9502 43.4412 64.1322 43.2704 64.2899 43.0786V44.0342H66.2832V36.7399H64.3126V37.7094Z"
        fill="#222222"
      />
      <path
        d="M72.7799 41.5122C72.6344 41.8188 72.4079 42.0807 72.1245 42.2702C71.8348 42.457 71.495 42.5532 71.1495 42.5461C70.8058 42.554 70.4679 42.4577 70.181 42.2702C69.9017 42.0799 69.68 41.8179 69.5396 41.5122C69.3881 41.1553 69.31 40.7721 69.31 40.3849C69.31 39.9977 69.3881 39.6144 69.5396 39.2576C69.6773 38.9499 69.8995 38.6868 70.181 38.4985C70.4695 38.3152 70.8068 38.2218 71.1495 38.2301C71.494 38.2226 71.8332 38.316 72.1245 38.4985C72.4099 38.6862 72.6369 38.949 72.7799 39.2576C72.9356 39.6133 73.016 39.997 73.016 40.3849C73.016 40.7727 72.9356 41.1564 72.7799 41.5122ZM72.9467 37.5129C72.8292 37.3912 72.7008 37.2801 72.5632 37.1811C72.0205 36.7966 71.3703 36.5894 70.7031 36.5885C70.0884 36.5787 69.4847 36.7514 68.9698 37.0845C68.4561 37.4222 68.0416 37.8886 67.7684 38.4362C67.4797 39.0483 67.3301 39.7157 67.3301 40.3913C67.3301 41.0669 67.4797 41.7343 67.7684 42.3464C68.0425 42.8911 68.4588 43.353 68.9742 43.6842C69.4909 44.0125 70.0937 44.1828 70.7075 44.1737C71.0405 44.1752 71.3719 44.1264 71.6901 44.0288C71.9879 43.9385 72.2699 43.8035 72.5264 43.6283C72.7095 43.5024 72.8743 43.3521 73.016 43.1817L73.0583 44.0352H74.9259V33.8357H72.9467V37.5129Z"
        fill="#222222"
      />
      <path
        d="M97.6199 20.8789H95.6406V31.0838H97.6199V20.8789Z"
        fill="#222222"
      />
      <path
        d="M67.1664 22.0096C67.3831 22.1943 67.6767 22.2856 68.058 22.2856C68.3793 22.3027 68.6954 22.1992 68.9431 21.9957C69.0514 21.8987 69.1367 21.7793 69.1928 21.6458C69.249 21.5123 69.2747 21.3682 69.2681 21.2237C69.275 21.0781 69.2495 20.9328 69.1933 20.7981C69.1372 20.6634 69.0517 20.5426 68.9431 20.4443C68.7264 20.2568 68.4289 20.1626 68.0504 20.1619C67.728 20.145 67.4113 20.251 67.1654 20.4582C66.958 20.6641 66.8416 20.9432 66.8418 21.2342C66.842 21.5251 66.9588 21.804 67.1664 22.0096Z"
        fill="#222222"
      />
      <path
        d="M72.3659 26.3536C72.5239 26.0507 72.7592 25.7942 73.0484 25.6095C73.3439 25.4303 73.6834 25.3349 74.0299 25.3335C74.3764 25.3322 74.7166 25.4251 75.0135 25.602C75.3038 25.7839 75.5377 26.0418 75.6895 26.3471C75.8566 26.6835 75.9406 27.0545 75.9344 27.4293C75.9404 27.8015 75.8564 28.1696 75.6895 28.503C75.5377 28.808 75.3037 29.0655 75.0135 29.247C74.7213 29.4276 74.3829 29.5211 74.0385 29.5165C73.6896 29.5223 73.3463 29.4288 73.0495 29.247C72.7584 29.0646 72.5226 28.8075 72.367 28.503C72.2103 28.1663 72.1292 27.8 72.1292 27.4293C72.1292 27.0586 72.2103 26.6923 72.367 26.3557L72.3659 26.3536ZM72.0246 30.7351C72.644 31.0566 73.3328 31.2246 74.032 31.2246C74.7313 31.2246 75.4201 31.0566 76.0394 30.7351C76.617 30.4206 77.0966 29.9554 77.4261 29.3898C77.7675 28.7935 77.9408 28.117 77.9277 27.4315C77.9415 26.7482 77.7681 26.0741 77.4261 25.4807C77.0938 24.9173 76.6149 24.4527 76.0394 24.1354C75.4214 23.8097 74.732 23.6394 74.032 23.6394C73.332 23.6394 72.6427 23.8097 72.0246 24.1354C71.4338 24.4599 70.944 24.9388 70.6086 25.5199C70.2732 26.1011 70.105 26.7622 70.1223 27.4315C70.1091 28.118 70.2851 28.7951 70.6315 29.3898C70.9649 29.9545 71.4463 30.4194 72.0246 30.7351Z"
        fill="#222222"
      />
      <path
        d="M88.9061 26.3266C89.0525 26.0274 89.2769 25.7724 89.5561 25.5879C89.8406 25.4064 90.1732 25.3129 90.5116 25.3195C90.8561 25.3125 91.1951 25.4058 91.4866 25.5879C91.7682 25.7696 91.9933 26.0254 92.1366 26.3266C92.2967 26.6676 92.3756 27.0404 92.3673 27.4164C92.3758 27.7986 92.297 28.1777 92.1366 28.5254C91.996 28.8284 91.7703 29.0848 91.4866 29.2641C91.1936 29.4422 90.8552 29.5331 90.5116 29.526C90.1741 29.5328 89.8421 29.4417 89.5561 29.2641C89.2747 29.0821 89.0498 28.8264 88.9061 28.5254C88.7413 28.179 88.6601 27.7993 88.6688 27.4164C88.6605 27.0397 88.7417 26.6663 88.9061 26.3266ZM88.307 30.7285C88.7953 31.059 89.3743 31.2326 89.9656 31.2256C90.2973 31.2272 90.6269 31.1735 90.9406 31.0667C91.2375 30.9659 91.5173 30.8211 91.7704 30.6373C91.9727 30.4923 92.1548 30.3215 92.3121 30.1294V31.085H94.3054V23.7885H92.3348V24.7548C92.1936 24.5586 92.0271 24.3813 91.8397 24.2277C91.602 24.0402 91.3334 23.8949 91.0457 23.7982C90.7251 23.6891 90.3879 23.6354 90.049 23.6393C89.4409 23.6297 88.8438 23.8002 88.3341 24.1289C87.8249 24.463 87.4138 24.9245 87.1424 25.4666C86.8422 26.0734 86.6936 26.7429 86.7091 27.4185C86.6963 28.0956 86.8447 28.7662 87.1424 29.3757C87.4075 29.9196 87.8111 30.3855 88.3135 30.7274"
        fill="#222222"
      />
      <path
        d="M64.7813 21.9409H62.802V23.7886H61.4219V25.5397H62.802V31.084H64.7813V25.5397H66.2871V23.7886H64.7813V21.9409Z"
        fill="#222222"
      />
      <path
        d="M69.0622 23.7886H67.083V31.0839H69.0622V23.7886Z"
        fill="#222222"
      />
      <path
        d="M85.7224 31.0838V26.6165C85.7386 26.0534 85.6414 25.4927 85.4364 24.9673C85.2706 24.5511 84.9719 24.2001 84.586 23.9678C84.1576 23.7346 83.6737 23.6203 83.1852 23.6371C82.7815 23.636 82.3822 23.7206 82.0142 23.8851C81.6567 24.041 81.3327 24.2633 81.0598 24.54C80.9959 24.6056 80.9355 24.6744 80.8788 24.7462L80.8431 23.7885H78.9473V31.0838H80.9243V26.698C80.9226 26.5126 80.963 26.3291 81.0424 26.1612C81.1219 25.9952 81.2321 25.8455 81.3674 25.72C81.5071 25.588 81.6732 25.4867 81.8549 25.4226C82.0539 25.351 82.264 25.3146 82.4757 25.3152C82.7182 25.2902 82.9629 25.3357 83.1798 25.4462C83.3734 25.5568 83.5232 25.7295 83.6045 25.9358C83.7054 26.1999 83.7529 26.4812 83.7442 26.7635V31.0796L85.7224 31.0838Z"
        fill="#222222"
      />
      <path
        d="M43.3438 21.4308V31.0838H45.3912V24.8718L50.0885 31.0838H51.9833V21.4308H49.9412V24.0644C49.9412 24.4595 49.9412 24.8256 49.9553 25.1606C49.9694 25.4955 49.9759 25.8144 49.99 26.1129C50.004 26.4114 50.0225 26.7012 50.0463 26.9815C50.0701 27.2617 50.095 27.5376 50.1221 27.8082C50.1297 27.879 50.1395 27.9531 50.1481 28.0229L45.2157 21.4297L43.3438 21.4308Z"
        fill="#222222"
      />
      <path
        d="M58.4588 28.5254C58.3181 28.8283 58.0925 29.0847 57.8088 29.2641C57.5159 29.4423 57.1774 29.5333 56.8338 29.526C56.4967 29.5326 56.1651 29.4415 55.8794 29.2641C55.5981 29.0821 55.3731 28.8264 55.2294 28.5254C55.0646 28.1786 54.9834 27.7985 54.9922 27.4153C54.9839 27.039 55.0652 26.666 55.2294 26.3266C55.3756 26.0275 55.6 25.7728 55.8794 25.589C56.1631 25.4063 56.4956 25.3124 56.8338 25.3195C57.1786 25.3117 57.5179 25.4055 57.8088 25.589C58.0906 25.7701 58.3157 26.0255 58.4588 26.3266C58.6179 26.6675 58.6964 27.0398 58.6885 27.4153C58.6969 27.7977 58.6185 28.1771 58.4588 28.5254ZM60.6255 31.0839V23.7885H58.6603V24.7548C58.5187 24.5588 58.3524 24.3816 58.1652 24.2277C57.9277 24.0399 57.659 23.8946 57.3712 23.7982C57.0505 23.6891 56.7134 23.6354 56.3745 23.6393C55.7664 23.6297 55.1693 23.8002 54.6596 24.1289C54.1504 24.463 53.7393 24.9245 53.4679 25.4666C53.1659 26.0726 53.0155 26.7417 53.0292 27.4174C53.0164 28.0952 53.1648 28.7665 53.4625 29.3768C53.7275 29.9204 54.1312 30.386 54.6336 30.7274C55.1221 31.0574 55.701 31.2309 56.2922 31.2245C56.6238 31.2261 56.9534 31.1724 57.2671 31.0656C57.564 30.9646 57.8437 30.8198 58.097 30.6362C58.2998 30.4914 58.482 30.3202 58.6386 30.1273V31.0839H60.6255Z"
        fill="#222222"
      />
      <path
        d="M45.0382 12.0645C45.1658 11.7079 45.3673 11.3817 45.6297 11.1068C45.8865 10.8378 46.1947 10.6221 46.5364 10.4723C46.8926 10.318 47.2777 10.2404 47.6663 10.2447C48.057 10.2413 48.4441 10.3188 48.8027 10.4723C49.1439 10.6187 49.4499 10.835 49.7008 11.1068C49.9573 11.3863 50.1583 11.7112 50.2934 12.0645C50.5818 12.8484 50.5818 13.7081 50.2934 14.492C50.1575 14.8475 49.9566 15.175 49.7008 15.4583C49.4523 15.7328 49.1456 15.9494 48.8027 16.0928C48.4429 16.2418 48.0563 16.3167 47.6663 16.3129C47.2787 16.3169 46.8944 16.2416 46.5375 16.0917C46.1939 15.9461 45.8848 15.7311 45.6297 15.4604C45.3679 15.1818 45.1666 14.853 45.0382 14.4942C44.7681 13.7071 44.7681 12.8537 45.0382 12.0667V12.0645ZM44.1033 16.8562C44.5564 17.3033 45.0943 17.6573 45.686 17.8976C46.9604 18.3929 48.3766 18.3929 49.651 17.8976C50.2406 17.6575 50.7761 17.3035 51.2261 16.8562C51.6785 16.4033 52.0321 15.8632 52.265 15.2693C52.7477 13.9884 52.7477 12.5778 52.265 11.2969C52.0318 10.7034 51.6782 10.1637 51.2261 9.71111C50.777 9.26109 50.2414 8.90479 49.651 8.66324C48.3768 8.16661 46.9602 8.16661 45.686 8.66324C45.0929 8.90389 44.5547 9.26024 44.1033 9.71111C43.6526 10.1621 43.2994 10.6995 43.0654 11.2904C42.8175 11.9257 42.6943 12.602 42.7025 13.2831C42.6961 13.964 42.8192 14.64 43.0654 15.2758C43.2966 15.8684 43.6501 16.4067 44.1033 16.8562Z"
        fill="#222222"
      />
      <path
        d="M55.5958 13.3754C55.7422 13.0762 55.9666 12.8212 56.2458 12.6368C56.5304 12.4552 56.863 12.3618 57.2013 12.3684C57.5458 12.3615 57.8848 12.4548 58.1763 12.6368C58.4577 12.8187 58.6827 13.0744 58.8263 13.3754C58.9854 13.7163 59.064 14.0886 59.056 14.4641C59.0638 14.8467 58.9845 15.2261 58.8242 15.5742C58.6833 15.877 58.4577 16.1334 58.1742 16.3129C57.8811 16.4909 57.5428 16.5818 57.1992 16.5749C56.8617 16.5816 56.5296 16.4905 56.2437 16.3129C55.9623 16.1309 55.7373 15.8752 55.5937 15.5742C55.4293 15.2273 55.3484 14.8473 55.3575 14.4641C55.3493 14.0878 55.4305 13.7148 55.5948 13.3754H55.5958ZM54.9957 17.7773C55.4854 18.1068 56.0656 18.2788 56.6575 18.2701C56.9891 18.2719 57.3187 18.2186 57.6325 18.1123C57.9291 18.0115 58.2085 17.8667 58.4612 17.6829C58.6635 17.5374 58.8456 17.3663 59.0029 17.1739V18.1306H60.9908V10.8374H59.0246V11.8036C58.8834 11.6076 58.7174 11.4305 58.5306 11.2765C58.2925 11.089 58.0235 10.9437 57.7354 10.847C57.4148 10.7379 57.0777 10.6841 56.7388 10.6881C56.131 10.6787 55.5343 10.8491 55.0249 11.1777C54.5158 11.5118 54.1047 11.9733 53.8333 12.5154C53.5306 13.1212 53.3797 13.7904 53.3934 14.4662C53.3806 15.1437 53.5291 15.8146 53.8268 16.4246C54.0918 16.9684 54.4955 17.4343 54.9978 17.7763"
        fill="#222222"
      />
      <path
        d="M64.1775 15.8501L64.8513 15.2252L67.188 18.1326H69.5714L66.1621 14.0099L69.5854 10.8373H66.979L64.1775 13.6427V7.92773H62.1982V18.1326H64.1775V15.8501Z"
        fill="#222222"
      />
      <path
        d="M15.2348 10.8834C14.9792 10.921 14.7473 11.0273 14.4938 11.0037C14.4538 11.0037 14.4126 11.0295 14.3714 11.0402C14.1548 11.096 13.95 11.2012 13.7128 11.1819C13.616 11.1882 13.5217 11.2154 13.4365 11.2614C13.2556 11.3322 13.0801 11.4149 12.8949 11.4836C12.3154 11.6872 11.7469 11.9205 11.1919 12.1825C10.8539 12.3532 10.5516 12.5744 10.2169 12.7451C10.1508 12.7795 10.0901 12.8525 10.0219 12.8525C9.79762 12.8729 9.65571 13.0253 9.49754 13.1499C9.20938 13.3753 8.9288 13.6105 8.63955 13.8338C8.54855 13.9047 8.43047 13.9412 8.34163 14.0131C8.12497 14.1902 7.9083 14.3706 7.71114 14.5671C7.31356 14.9579 6.89973 15.3347 6.53465 15.7577C6.24483 16.0745 5.97973 16.4126 5.74165 16.7691C5.72414 16.8089 5.69955 16.8453 5.66907 16.8765C5.40582 17.0654 5.29966 17.3746 5.09599 17.6076C4.94974 17.773 4.91616 17.9931 4.80024 18.1734C4.66808 18.3785 4.54891 18.5911 4.40808 18.7918C4.30878 18.9319 4.22694 19.0833 4.16433 19.2428C4.08794 19.4634 3.9997 19.6799 3.9 19.8912C3.80081 20.1171 3.71544 20.3487 3.64434 20.5848C3.52409 20.9176 3.40167 21.2483 3.28684 21.5822C3.26096 21.6754 3.24106 21.77 3.22726 21.8657C3.12651 22.381 3.01926 22.8953 2.92609 23.4117C2.89359 23.5899 2.89359 23.7724 2.87842 23.9625C3.09297 24.0413 3.3141 24.1013 3.53925 24.1418C3.78842 24.2073 4.04192 24.2556 4.29758 24.3189C4.62258 24.4005 4.94758 24.4918 5.26607 24.5777C5.48274 24.6346 5.50657 24.6539 5.51957 24.8847C5.53149 25.0887 5.54016 25.2927 5.53257 25.4967C5.50187 26.118 5.5189 26.7407 5.58349 27.3594C5.61707 27.6568 5.6214 27.9585 5.64632 28.2581C5.66365 28.4599 5.68965 28.6618 5.71782 28.8636C5.72865 28.9474 5.76332 29.0279 5.77524 29.1127C5.80774 29.3274 5.90415 29.5185 5.8944 29.7418C5.88899 29.861 5.96482 29.9845 6.00274 30.1047C6.04065 30.225 6.10023 30.3195 6.0634 30.4461C6.05957 30.4562 6.05957 30.4673 6.0634 30.4773C6.16779 30.7563 6.24789 31.0436 6.30282 31.3362C6.36023 31.5842 6.48482 31.8129 6.5054 32.0749C6.5263 32.169 6.56528 32.2583 6.62023 32.3379C6.75861 32.6031 6.88335 32.8751 6.99398 33.1528C7.14889 33.5382 7.35148 33.9043 7.53564 34.2812C7.67214 34.5603 7.80864 34.8384 7.94405 35.1175C7.96001 35.1687 7.98068 35.2183 8.0058 35.2657C8.28639 35.6318 8.47055 36.0613 8.76413 36.4231C8.8638 36.5487 8.95155 36.684 9.04471 36.815C9.05111 36.8235 9.05691 36.8325 9.06205 36.8418C9.1173 36.9416 9.07938 37.0726 9.19638 37.1564C9.28706 37.2316 9.37015 37.3154 9.44446 37.4065C9.47479 37.4377 9.51704 37.4645 9.53113 37.501C9.65571 37.8371 9.94604 38.0443 10.1595 38.3105C10.231 38.3897 10.2945 38.4756 10.349 38.5671C10.4133 38.6653 10.4901 38.7548 10.5776 38.8334C10.6523 38.897 10.7192 38.9691 10.777 39.0481C10.8962 39.2391 11.0492 39.4071 11.2287 39.5441C11.4844 39.7728 11.7151 40.0294 11.9643 40.2667C12.1907 40.4814 12.4279 40.6833 12.6609 40.8905C12.6923 40.9195 12.7508 40.9345 12.7616 40.9678C12.8461 41.2233 13.1094 41.2673 13.2848 41.4144C13.4322 41.5379 13.6098 41.6291 13.7182 41.7966C13.7712 41.8643 13.8395 41.9187 13.9175 41.9555C14.2642 42.1531 14.5892 42.385 14.925 42.5997C15.2652 42.8271 15.621 43.0305 15.9899 43.2085C16.3019 43.3534 16.6052 43.5166 16.9237 43.6486C17.1133 43.727 17.3094 43.7925 17.4914 43.8848C17.8023 44.0437 18.1013 43.9815 18.396 43.8559C18.5736 43.7796 18.7416 43.6809 18.9138 43.5917C19.306 43.3899 19.6992 43.1891 20.0903 42.983C20.165 42.9443 20.2279 42.8831 20.3005 42.8391C20.3889 42.7795 20.4824 42.7278 20.58 42.6845C20.6895 42.6413 20.7934 42.5854 20.8898 42.5181C21.0675 42.3979 21.2614 42.3034 21.4466 42.196C21.6745 42.0736 21.89 41.9298 22.0901 41.7666C22.1549 41.711 22.228 41.6657 22.3068 41.6324C22.4051 41.5885 22.49 41.5196 22.5527 41.4327C22.6109 41.3701 22.6768 41.3149 22.7488 41.2684C22.9449 41.1159 23.142 40.9667 23.337 40.8153C23.4378 40.7359 23.5364 40.6532 23.6349 40.5705C23.6708 40.5473 23.7014 40.517 23.7249 40.4814C23.8094 40.3096 23.9719 40.2162 24.1062 40.0938C24.2405 39.9714 24.3727 39.8437 24.5016 39.7159C24.5785 39.6408 24.6446 39.5538 24.7248 39.4819C24.8228 39.397 24.9034 39.2942 24.962 39.1791C25.0007 39.101 25.0503 39.0288 25.1093 38.9644C25.3358 38.7056 25.5665 38.4512 25.794 38.1935C25.8323 38.1561 25.8638 38.1126 25.8872 38.0647C25.9799 37.847 26.1176 37.651 26.2913 37.4892C26.4389 37.3194 26.5529 37.1234 26.6271 36.9116C26.6767 36.7709 26.7499 36.6395 26.8437 36.5229C26.9484 36.4138 27.0262 36.2823 27.0712 36.1386C27.0945 36.0673 27.1266 35.9992 27.1666 35.9356C27.3659 35.5813 27.5674 35.2281 27.7667 34.8738C27.8567 34.7149 27.9455 34.5603 27.9108 34.3596C27.913 34.2744 27.9352 34.1909 27.9758 34.1158C28.0083 34.0257 28.0473 33.9376 28.0842 33.8506C28.2488 33.4888 28.3008 33.0927 28.4287 32.7201C28.6409 32.0814 28.7712 31.4188 28.8165 30.7478C28.8555 30.2336 28.9725 29.7333 29.0332 29.2233C29.0332 29.2136 29.0429 29.205 29.057 29.1782C29.1046 29.1478 29.1579 29.1271 29.2138 29.1175C29.2696 29.108 29.3268 29.1096 29.382 29.1224C29.7362 29.1825 30.0926 29.1224 30.4469 29.1428C30.759 29.1662 31.0726 29.1623 31.384 29.1309C31.4521 29.1321 31.5198 29.1418 31.5855 29.1599C31.6602 29.3475 31.6924 29.5491 31.6797 29.7504C31.6584 30.0491 31.6522 30.3487 31.6613 30.648C31.6613 30.6802 31.6678 30.7221 31.6516 30.7425C31.5226 30.9035 31.5876 31.0882 31.5822 31.2632C31.5735 31.5531 31.5822 31.8429 31.4479 32.1146C31.4195 32.1828 31.4041 32.2556 31.4024 32.3293C31.3759 32.5951 31.3291 32.8585 31.2626 33.1174C31.1836 33.4749 31.02 33.8045 30.9485 34.162C30.9455 34.1835 30.9377 34.204 30.9257 34.2221C30.7405 34.4465 30.7351 34.7407 30.6224 34.993C30.4967 35.2764 30.3776 35.5631 30.2519 35.8519C30.2053 35.9593 30.1327 36.057 30.0959 36.1676C29.9941 36.4746 29.7644 36.7162 29.6626 37.0265C29.5824 37.2755 29.4188 37.4763 29.2931 37.6986C29.1913 37.9104 29.062 38.1082 28.9086 38.2869C28.7645 38.4361 28.6919 38.653 28.5836 38.8377C28.5472 38.9143 28.4943 38.9821 28.4287 39.0363C28.2204 39.1873 28.0514 39.3853 27.9357 39.6139C27.8411 39.7711 27.7323 39.9195 27.6107 40.0573C27.3226 40.403 27.0387 40.7541 26.7192 41.0719C26.5144 41.2759 26.353 41.5207 26.1168 41.6968C26.0784 41.7342 26.0446 41.776 26.0161 41.8213C25.8072 42.0654 25.5801 42.2936 25.3368 42.5042C25.3013 42.5448 25.2573 42.5774 25.2079 42.5997C25.014 42.6588 24.8829 42.8026 24.7345 42.9218C24.5363 43.0861 24.3239 43.2342 24.1192 43.392C24.0109 43.4779 23.9025 43.5713 23.7942 43.6594C23.7444 43.6991 23.6945 43.7667 23.6393 43.7667C23.4421 43.7871 23.3143 43.9235 23.1594 44.019C22.869 44.2026 22.5949 44.4131 22.3079 44.6031C22.1496 44.7126 21.9821 44.8085 21.8074 44.8898C21.4824 45.0336 21.1877 45.2387 20.8616 45.374C20.5843 45.4889 20.3135 45.6155 20.0372 45.7326C19.8498 45.812 19.67 45.9097 19.4869 45.9999C19.4223 46.0402 19.3549 46.0761 19.2854 46.1073C19.0297 46.191 18.7708 46.2683 18.5141 46.3488C18.4616 46.3619 18.411 46.3814 18.3635 46.4068C18.2562 46.4784 18.1287 46.5141 17.9995 46.5088C17.9356 46.5017 17.8711 46.5129 17.8135 46.5411C17.7559 46.5692 17.7076 46.6132 17.6745 46.6677C17.3916 46.6329 17.1185 46.5432 16.8707 46.4036C16.654 46.2853 16.4247 46.1913 16.1871 46.1234C15.9198 46.0366 15.6635 45.9195 15.4233 45.7744C15.2235 45.6463 15.0094 45.5415 14.7853 45.462C14.7063 45.4303 14.6331 45.3861 14.5686 45.331C14.5024 45.2766 14.4234 45.2397 14.3389 45.2237C14.2221 45.1993 14.1151 45.1414 14.0313 45.0573C13.9109 44.9367 13.7619 44.8481 13.5979 44.7996C13.5094 44.7613 13.4284 44.7079 13.3585 44.6418C13.1917 44.5258 13.0476 44.3819 12.8364 44.3326C12.7478 44.2947 12.6682 44.2391 12.6024 44.1694C12.4258 44.0276 12.2709 43.8473 12.0748 43.7453C11.8546 43.6114 11.6427 43.4648 11.4399 43.3062C11.0892 43.0547 10.7628 42.7715 10.465 42.4601C10.2196 42.191 9.94936 41.9451 9.65788 41.7258C9.61412 41.6942 9.57382 41.6583 9.53763 41.6184C9.28196 41.3446 9.02521 41.0698 8.77172 40.7928C8.73197 40.7435 8.69577 40.6914 8.66338 40.6371C8.63532 40.5793 8.60001 40.5251 8.5583 40.4761C8.34271 40.2822 8.14844 40.0663 7.97872 39.8319C7.79781 39.6075 7.59306 39.4024 7.46306 39.1362C7.45329 39.1053 7.43663 39.0771 7.41431 39.0535C7.15539 38.8677 7.08931 38.5585 6.9214 38.3137C6.81306 38.1484 6.71556 37.9637 6.54006 37.8424C6.47702 37.7951 6.42617 37.7337 6.39165 37.6631C6.29523 37.4849 6.20965 37.3002 6.11432 37.1209C6.02996 36.947 5.93405 36.7788 5.82724 36.6174C5.61692 36.3054 5.43562 35.9752 5.28557 35.6307C5.21949 35.4955 5.14691 35.3645 5.07866 35.2303C4.88908 34.8609 4.67783 34.5013 4.5825 34.089C4.54003 33.9582 4.4845 33.832 4.41675 33.7121C4.36551 33.6073 4.31994 33.4997 4.28025 33.3901C4.20441 33.1582 4.17192 32.9112 4.00942 32.7115C3.97627 32.6566 3.95316 32.5962 3.94117 32.5333C3.822 32.1801 3.70175 31.8268 3.58475 31.4725C3.54467 31.3502 3.51217 31.2256 3.47642 31.1011C3.33342 30.575 3.15901 30.0564 3.08317 29.5132C3.07126 29.4294 3.06042 29.3446 3.05501 29.2587C3.04947 29.0873 3.02143 28.9173 2.97159 28.753C2.94458 28.6606 2.92787 28.5656 2.92176 28.4696C2.89359 28.1829 2.87192 27.8952 2.84809 27.6107C2.84767 27.5892 2.84439 27.5679 2.83834 27.5473C2.74196 27.2851 2.70497 27.0051 2.73001 26.7271C2.73001 26.7196 2.71809 26.7099 2.70076 26.6841C2.49818 26.6369 2.28043 26.5768 2.0616 26.536C1.43868 26.4061 0.815773 26.2815 0.192861 26.1538C0.0444451 26.1237 0.00761208 26.0872 0.00219545 25.939C-0.00388603 25.8537 0.00268377 25.768 0.0216953 25.6846C0.107393 25.4066 0.130324 25.1134 0.0888615 24.8257C0.075516 24.7391 0.0821835 24.6506 0.108361 24.5669C0.200444 24.2642 0.197194 23.9517 0.216694 23.6425C0.254382 23.2484 0.319537 22.8574 0.411692 22.4723C0.478859 22.1276 0.498358 21.7723 0.641357 21.4448C0.682423 21.0076 0.812515 20.5832 1.02377 20.1972C1.08294 20.0835 1.11517 19.9579 1.11802 19.83C1.1259 19.6046 1.19313 19.3851 1.31302 19.1934C1.43518 18.9934 1.53368 18.7801 1.6066 18.5578C1.69868 18.2872 1.8081 18.021 1.9251 17.7558C2.10576 17.3799 2.30683 17.0139 2.52743 16.6596C2.60512 16.5439 2.69091 16.4338 2.78418 16.33C2.81394 16.2973 2.83975 16.2613 2.86109 16.2226C3.02576 15.8469 3.27817 15.5258 3.50567 15.1898C3.56974 15.0918 3.63993 14.9978 3.71584 14.9085C3.87183 14.7313 4.04083 14.5606 4.19575 14.3867C4.22787 14.3579 4.25464 14.3238 4.27483 14.2858C4.368 14.055 4.55433 13.9079 4.74174 13.7629C4.84603 13.6727 4.93685 13.5682 5.01149 13.4527C5.15915 13.2706 5.32185 13.1011 5.49791 12.9459C5.58999 12.8557 5.70699 12.7902 5.79257 12.6947C5.95837 12.5249 6.1397 12.3707 6.33423 12.2341C6.5509 12.0623 6.78273 11.898 6.98423 11.708C7.26269 11.4553 7.57783 11.2454 7.91914 11.0853C7.94839 11.0713 7.9863 11.0595 7.9993 11.0348C8.0968 10.8598 8.27013 10.7986 8.4413 10.731C8.5028 10.7093 8.55973 10.6765 8.60922 10.6344C8.81288 10.4422 9.0783 10.3788 9.33071 10.2865C9.52859 10.2311 9.71293 10.1361 9.87237 10.0074C9.9219 9.96549 9.97884 9.93309 10.0403 9.9118C10.3323 9.8061 10.6156 9.67795 10.8874 9.52851C11.0985 9.41941 11.3267 9.34679 11.5624 9.31379C11.6592 9.30713 11.7512 9.26944 11.8245 9.20642C11.9134 9.12504 12.0286 9.07782 12.1495 9.07329C12.3978 9.0591 12.64 8.99131 12.8591 8.87467C12.9427 8.83076 13.0354 8.80652 13.1299 8.80381C13.4537 8.78526 13.7739 8.7272 14.0833 8.63095C14.1135 8.61936 14.1452 8.61213 14.1775 8.60948C14.4852 8.62773 14.7679 8.49031 15.0702 8.47098C15.2098 8.45463 15.3483 8.43025 15.4851 8.39797C15.504 8.34293 15.5188 8.2866 15.5295 8.22941C15.5566 7.97389 15.6682 7.74091 15.7332 7.49505C15.7547 7.43518 15.7731 7.37426 15.7884 7.31253C15.8805 6.72525 16.1015 6.18414 16.3301 5.63659C16.5587 5.08903 16.8338 4.57261 17.0765 4.03794C17.0924 3.99881 17.1148 3.96254 17.1426 3.93058C17.3441 3.72766 17.4481 3.46677 17.5856 3.2252C17.6302 3.13976 17.6871 3.06127 17.7546 2.99222C17.9314 2.83476 18.0782 2.64711 18.188 2.43823C18.259 2.29429 18.349 2.16034 18.4556 2.03991C18.7654 1.69706 19.081 1.3603 19.4024 1.02962C19.5216 0.906148 19.6591 0.800932 19.7891 0.687127C19.8975 0.595868 20.0058 0.508903 20.1022 0.41335C20.2723 0.251231 20.438 0.0815963 20.6915 0C20.8294 0.0416484 20.9482 0.129763 21.0274 0.249083C21.2538 0.579763 21.5495 0.848172 21.828 1.13269C22.0757 1.38606 22.3209 1.64302 22.5635 1.90356C22.6107 1.96153 22.6534 2.0229 22.6914 2.08715C22.6814 2.15114 22.6588 2.21255 22.6247 2.26783C22.5907 2.32311 22.546 2.37117 22.4931 2.40924C22.3523 2.52412 22.2136 2.64436 22.0728 2.76032C22.0365 2.80034 21.9918 2.83188 21.9417 2.85265C21.7695 2.88808 21.673 3.01906 21.5571 3.13072C21.348 3.33149 21.1758 3.56769 20.9288 3.73088C20.8608 3.78434 20.8025 3.84898 20.7565 3.92199C20.6518 4.07166 20.5284 4.20765 20.3893 4.32675C20.3173 4.39186 20.2588 4.47027 20.217 4.55758C20.0215 4.91449 19.8078 5.26136 19.5768 5.59686C19.4053 5.8569 19.2633 6.13486 19.1532 6.42571C19.1381 6.46543 19.137 6.52341 19.1088 6.54381C18.8997 6.69304 18.916 6.93783 18.8434 7.1429C18.7859 7.35915 18.7034 7.56811 18.5975 7.7656C18.4891 7.94705 18.5076 8.17573 18.4751 8.40979C18.6917 8.38402 18.8791 8.44629 19.0687 8.37436C19.1037 8.36644 19.1399 8.36644 19.1749 8.37436C19.5075 8.39153 19.8422 8.39475 20.1737 8.43233C20.5908 8.48065 21.0046 8.5558 21.4195 8.62236C21.4823 8.63786 21.5439 8.65796 21.6037 8.68249C21.7019 8.72642 21.8053 8.75815 21.9114 8.77697C22.2029 8.79017 22.4884 8.86329 22.7499 8.9917C22.7911 9.00488 22.8344 9.01035 22.8777 9.0078C22.9097 9.00401 22.9421 9.00401 22.9741 9.0078C23.1392 9.08347 23.3116 9.14246 23.4887 9.18388C23.6587 9.2096 23.8227 9.26523 23.9729 9.34814C24.2394 9.48879 24.5081 9.62514 24.7789 9.75935C24.8493 9.78956 24.9217 9.81503 24.9956 9.83557C25.2457 9.90521 25.4815 10.0179 25.6922 10.1684C25.755 10.2099 25.8213 10.2458 25.8904 10.2758C25.9923 10.3337 26.0984 10.3831 26.1948 10.4551C26.261 10.5096 26.34 10.5465 26.4245 10.5624C26.5409 10.5874 26.6476 10.6447 26.7322 10.7278C27.0485 10.9844 27.3735 11.2324 27.6952 11.4793C27.7288 11.5061 27.7602 11.5469 27.8036 11.5545C28.0625 11.6049 28.2304 11.7928 28.4243 11.9442C28.4742 11.9839 28.5327 12.0065 28.5868 12.0451C28.696 12.1141 28.7968 12.1956 28.8869 12.2878C29.0653 12.4887 29.2586 12.676 29.4654 12.8482C29.5932 12.962 29.7102 13.0876 29.8272 13.2122C29.9333 13.333 30.0532 13.4411 30.1847 13.5342C30.2128 13.5506 30.2374 13.5721 30.2573 13.5976C30.5216 13.9637 30.8477 14.2772 31.1478 14.6122C31.1883 14.6613 31.2246 14.7137 31.2561 14.7689C31.3926 14.9837 31.527 15.207 31.6624 15.426C31.676 15.455 31.6956 15.481 31.7198 15.5022C32.0448 15.6976 32.1531 16.0455 32.3416 16.3429C32.3698 16.388 32.3806 16.4438 32.411 16.4867C32.6248 16.7959 32.7991 17.1303 32.9299 17.482C32.9458 17.5334 32.9724 17.5809 33.0079 17.6216C33.2993 17.9168 33.4033 18.3044 33.5376 18.6759C33.5776 18.8071 33.6291 18.9347 33.6915 19.057C33.7811 19.2271 33.8495 19.4074 33.8951 19.5938C33.9623 19.8311 34.0154 20.0716 34.0652 20.3132C34.092 20.4381 34.1342 20.5592 34.1909 20.6739C34.2819 20.865 34.3989 21.054 34.375 21.2816C34.3736 21.3141 34.3788 21.3466 34.3902 21.3772C34.4974 21.7137 34.5518 22.0646 34.5516 22.4175C34.5516 22.4916 34.5809 22.5646 34.5874 22.6397C34.6014 22.7879 34.609 22.9371 34.6188 23.0864C34.6167 23.1078 34.6167 23.1294 34.6188 23.1508C34.6805 23.3913 34.6524 23.6382 34.6773 23.8809C34.7058 24.0603 34.7094 24.2427 34.6881 24.4231C34.6731 24.5725 34.6662 24.7227 34.6675 24.8729C34.6491 25.1381 34.6264 25.4033 34.6025 25.6942C34.3458 25.8521 34.0717 26.0163 33.7359 26.0163C33.7034 26.0171 33.6712 26.0229 33.6405 26.0335C33.0035 26.2611 32.3308 26.2987 31.671 26.4007C31.4807 26.4326 31.2868 26.4387 31.0947 26.4189C30.8583 26.4092 30.6215 26.4171 30.3862 26.4426C30.1712 26.4629 29.9542 26.451 29.7427 26.4071C29.5838 26.3752 29.4211 26.3658 29.2596 26.3792C29.0212 26.3857 28.7862 26.4082 28.5576 26.3159C28.5157 26.3057 28.4728 26.3 28.4297 26.2987C28.1362 26.259 27.8242 26.2987 27.5631 26.1151C27.549 26.1044 27.5208 26.1151 27.4992 26.1151C27.2631 26.1055 27.0293 26.0654 26.8037 25.9959C26.2407 25.8448 25.6873 25.6609 25.1462 25.4452C24.9225 25.341 24.6923 25.251 24.4572 25.1757C24.4359 25.1715 24.4156 25.1631 24.3976 25.151C24.0206 24.8547 23.545 24.7473 23.1399 24.5068C22.8831 24.35 22.6448 24.1665 22.3815 24.0172C21.9775 23.7853 21.6525 23.4503 21.27 23.1894C20.9339 22.9569 20.6137 22.7026 20.3113 22.4282C20.048 22.1931 19.7696 21.9677 19.5714 21.6681C19.5139 21.6038 19.4516 21.5439 19.3851 21.4888C19.2269 21.3149 19.0492 21.1571 18.9517 20.9359C18.9167 20.8818 18.8736 20.8333 18.8239 20.792C18.6191 20.5601 18.4036 20.3368 18.2746 20.048C18.2508 19.9954 18.1793 19.9642 18.1425 19.9138C17.9754 19.7039 17.8199 19.4853 17.6766 19.2589C17.4286 18.8294 17.1816 18.4064 16.9768 17.9608C16.8208 17.6226 16.628 17.3006 16.5218 16.9355C16.4341 16.6295 16.2716 16.345 16.1427 16.0508C16.1095 15.9958 16.0874 15.9349 16.0777 15.8716C16.0777 15.6074 15.9639 15.3809 15.8783 15.1404C15.7213 14.7294 15.6186 14.2999 15.5728 13.8628C15.5728 13.8102 15.5512 13.7554 15.5414 13.706C15.4959 13.4541 15.4511 13.2036 15.4071 12.9545C15.4011 12.9338 15.4011 12.9118 15.4071 12.8911C15.5002 12.7065 15.4071 12.5368 15.3702 12.3618C15.3288 12.186 15.3109 12.0055 15.3172 11.825C15.3387 11.514 15.3101 11.2017 15.2327 10.8995L15.2348 10.8834ZM18.2161 10.9414C18.1594 11.1118 18.1398 11.2922 18.1587 11.4707C18.1793 11.7488 18.1739 12.0301 18.2205 12.3039C18.2974 12.7677 18.2822 13.2454 18.4371 13.6996C18.4956 13.8746 18.4805 14.0603 18.5249 14.2364C18.6563 14.767 18.8358 15.2849 19.0611 15.7835C19.1584 15.9983 19.2434 16.2184 19.3157 16.4427C19.3341 16.513 19.3634 16.58 19.4024 16.6413C19.501 16.7809 19.5801 16.9345 19.6667 17.0815C19.6396 17.2737 19.7859 17.3918 19.8671 17.5368C19.9094 17.6119 19.9679 17.6774 20.0025 17.7515C20.1312 18.0049 20.2858 18.2445 20.464 18.4665C20.7143 18.8133 20.9927 19.1418 21.2581 19.479C21.2898 19.5101 21.3159 19.5464 21.335 19.5863C21.4044 19.7914 21.5734 19.9138 21.7218 20.0523C21.9265 20.2412 22.1443 20.4184 22.2873 20.6653C22.3108 20.7001 22.3405 20.7303 22.375 20.7544C22.6859 21.0025 22.9979 21.2483 23.3099 21.4953C23.83 21.8949 24.3781 22.2573 24.9501 22.5796C25.2848 22.7729 25.6543 22.9017 25.9663 23.1379C26.0234 23.1685 26.0847 23.1905 26.1483 23.2034C26.3047 23.2442 26.4575 23.2974 26.6054 23.3623C26.7352 23.4382 26.8769 23.4919 27.0247 23.5212C27.0857 23.5399 27.1446 23.5651 27.2002 23.5964C27.266 23.6307 27.3345 23.6597 27.4049 23.6833C27.5934 23.7295 27.7841 23.7735 27.9747 23.8068C28.2943 23.8615 28.6139 23.9227 28.9357 23.9517C29.1816 23.9732 29.4156 24.0591 29.668 24.0505C29.993 24.0408 30.3071 24.1332 30.6343 24.0859C30.8138 24.0441 31.0001 24.0397 31.1814 24.0731C31.2352 24.0753 31.289 24.0687 31.3406 24.0537C31.4138 24.0377 31.4891 24.0326 31.5638 24.0387C31.6387 24.0534 31.7159 24.0526 31.7904 24.0364C31.865 24.0201 31.9354 23.9887 31.9971 23.9442C32.0009 23.8906 32.0009 23.8368 31.9971 23.7832C31.9511 23.5166 31.938 23.2455 31.9581 22.9758C31.9614 22.9221 31.957 22.8683 31.9451 22.8158C31.878 22.4368 31.813 22.0578 31.736 21.681C31.6851 21.4287 31.6212 21.1796 31.5573 20.9294C31.5226 20.7942 31.4782 20.6621 31.436 20.529C31.3311 20.1468 31.1941 19.774 31.0265 19.4145C30.9971 19.3698 30.9779 19.3192 30.9701 19.2664C30.961 19.1599 30.9236 19.0577 30.8618 18.9701C30.6451 18.575 30.4209 18.1842 30.2118 17.7891C30.1182 17.5973 30.0022 17.4172 29.8662 17.2522C29.7927 17.174 29.727 17.0887 29.6701 16.9978C29.4535 16.6231 29.1707 16.2999 28.927 15.9467C28.8362 15.8019 28.7172 15.6763 28.5771 15.5774C28.4689 15.5054 28.3752 15.414 28.3008 15.3079C28.0484 14.9536 27.6942 14.7013 27.3887 14.3996C27.1991 14.2139 26.9705 14.0689 26.7701 13.8896C26.5469 13.6921 26.3032 13.5117 26.067 13.327C25.9119 13.2106 25.7502 13.1031 25.5828 13.0049C25.1169 12.7172 24.6717 12.394 24.1571 12.189C23.9996 12.1463 23.8554 12.0651 23.7379 11.9528C23.7158 11.9287 23.6866 11.9121 23.6544 11.9055C23.3387 11.8365 23.0343 11.7241 22.7499 11.5716C22.7217 11.5577 22.687 11.5577 22.6567 11.5459C22.6045 11.533 22.555 11.5112 22.5104 11.4815C22.4043 11.4072 22.281 11.3607 22.1519 11.3462C21.8349 11.2866 21.522 11.2077 21.2148 11.11C20.9873 11.0295 20.7251 11.0531 20.4987 10.9425C20.099 10.9425 19.7046 10.8545 19.3071 10.8867C19.1461 10.9038 18.9838 10.9038 18.8228 10.8867C18.623 10.8632 18.4205 10.877 18.2259 10.9275"
        fill="#222222"
      />
    </svg>
  );
};
