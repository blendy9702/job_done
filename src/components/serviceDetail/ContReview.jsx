import { useEffect, useState } from "react";
import { reviewListState } from "../../atoms/reviewAtom";
import { ReviewDiv, StarTotalDiv } from "./serviceDetail";
import { useRecoilState, useRecoilValue } from "recoil";
import { businessDetailState } from "../../atoms/businessAtom";
import { FaStar, FaStarHalf } from "react-icons/fa";
import axios from "axios";

// parser
import parse from "html-react-parser";
import { FilterDiv } from "../service/service";
import { IoIosArrowDown } from "react-icons/io";

const ContReview = () => {
  const BASE_URL = "http://112.222.157.156:5224";
  const [rating, setRating] = useState(0); // 별점
  const [reviewList, setReviewList] = useRecoilState(reviewListState);
  const businessDetail = useRecoilValue(businessDetailState);
  const options = ["최신순", "높은별점순", "낮은별점순"];
  const [optionOpen, setOptionOpen] = useState(false);
  const [status, setStatus] = useState(0); // 리뷰 정렬 상태
  const [selectedOption, setSelectedOption] = useState("최신순"); // Default selected option
  const businessId = businessDetail.businessId;
  const page = 1;
  const size = 5;
  // git 커밋 테스트
  // 리뷰 목록 가져오기
  const getReviewList = async (businessId, status) => {
    try {
      const res = await axios.get(
        `/api/review?businessId=${businessId}&status=${status}&page=${page}&size=${size}&sortType=${sortType}`,
      );
      console.log("---------------reviewList@@@", res.data.resultData);
      setReviewList(res.data.resultData);
    } catch (error) {
      console.log(error);
    }
  };

  // 정렬 방식에 따른 API 호출
  const handleSortTypeClick = (businessId, status, option) => {
    setOptionOpen(!optionOpen);
    setStatus(status);
    setSelectedOption(option); // Update the selected option text
    getReviewList(businessId, status);
  };

  useEffect(() => {
    getReviewList(businessId, status);
  }, [businessId, status]);

  // 별점 렌더링
  const renderStars = score => {
    const fullStars = Math.floor(score); // 채워진 별 개수
    const halfStar = score % 1 >= 0.5; // 반쪽 별 여부
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0); // 비어 있는 별 개수

    return (
      <>
        {Array.from({ length: fullStars }, (_, i) => (
          <FaStar key={`full-${i}`} color="#EAB838" />
        ))}
        {halfStar && <FaStarHalf key="half" color="#EAB838" />}
        {Array.from({ length: emptyStars }, (_, i) => (
          <FaStar key={`empty-${i}`} color="#E0E2E7" />
        ))}
      </>
    );
  };

  return (
    <>
      <StarTotalDiv>
        <h4>{businessDetail.businessName}</h4>
        <div className="star-container">
          <p className="star"> {renderStars(reviewList[0]?.averageScore)}</p>
          <span className="star-grade">
            {reviewList.length > 0 && reviewList[0]?.averageScore.toFixed(1)}
          </span>
        </div>
      </StarTotalDiv>
      <ReviewDiv>
        <div className="rv-top">
          <h3>서비스 리뷰 {businessDetail.reviewCount}</h3>
          <FilterDiv>
            <div className="select" onClick={() => setOptionOpen(!optionOpen)}>
              <p>{selectedOption}</p>
              <IoIosArrowDown />
            </div>
            {optionOpen && (
              <div className="options">
                {options.map((item, index) => (
                  <div
                    key={item}
                    onClick={() => handleSortTypeClick(businessId, index, item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </FilterDiv>
        </div>
        <div className="rv-list">
          {reviewList?.map((item, index) => (
            <div className="rv-item" key={index}>
              {/* 유저리뷰 */}
              <div className="user-rv">
                <div className="user-info">
                  <div className="user-photo">
                    {item.writerPic ? (
                      <img
                        src={`${BASE_URL}${item.writerPic}`}
                        alt={item.name}
                      />
                    ) : (
                      <img style={{ backgroundColor: "#34c5f0" }}></img>
                    )}
                  </div>
                  <div className="desc">
                    <div>
                      {renderStars(item.score)}
                      <span className="star-grade">
                        {item.score.toFixed(1)}
                      </span>
                      <b>{item.createdAt.slice(0, 10)}</b>
                    </div>
                    <h4>{item.name.slice(0, 1)}**</h4>
                  </div>
                </div>
                <div className="comment">
                  <span>{item.contents}</span>
                  <div className="photo">
                    {item.pics &&
                      item.pics.slice(0, 2).map((pic, index) => (
                        <div key={index}>
                          <img src={`${BASE_URL}${pic}`} alt="review-img" />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              {/* 사장님댓글 */}
              <div className="reply">
                <div className="info">
                  <div className="logo-container">
                    {/* 로고 */}
                    {item.comment && item.comment.logo ? (
                      <img
                        src={`${BASE_URL}${item.comment.logo}`}
                        alt="logo"
                        className="logo"
                      />
                    ) : (
                      <div className="logo-placeholder">👤</div>
                    )}
                  </div>
                  {/* 업체이름 , 작성일 */}
                  {item.comment && item.comment.name ? (
                    <h4>{item.comment.name}</h4>
                  ) : (
                    <h4>사장님</h4>
                  )}
                  <b>
                    {item.comment
                      ? item.comment.createdAt.slice(0, 10)
                      : "없음"}
                  </b>
                </div>
                <div className="comment">
                  {/* 업체 댓글 내용 */}
                  <span>
                    {item.comment ? parse(item.comment.contents) : <></>}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ReviewDiv>
    </>
  );
};

export default ContReview;
