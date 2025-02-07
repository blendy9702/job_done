import axios from "axios";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
  commentModals,
  commentsBox,
  reviewIdState,
  reviewListState,
} from "../../../atoms/reviewAtom";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../../../apis/login";

function Index() {
  const [reviewDatas, setReviewDatas] = useRecoilState(reviewListState);
  const [commentModal, setCommentModal] = useRecoilState(commentModals);
  const [commentBox, setCommentBox] = useRecoilState(commentsBox);
  const [reviewIds, setReviewIds] = useRecoilState(reviewIdState);
  const [commentData, setCommentData] = useState();
  const [isSorted, setIsSorted] = useState(false);
  const [isScored, setIsScored] = useState(false);
  const navigate = useNavigate();
  const busiId = localStorage.getItem("businessId");

  // 리뷰데이터 불러오기
  const reviewData = async () => {
    try {
      const res = await loginApi.get(
        `/api/review?businessId=${busiId}&state=0&page=1&size=30`,
        // `/api/review?businessId=2&page=1&size=30`,
      );
      console.log(res);
      if (res) {
        const formattedData = res.data.resultData.map((item, index) => ({
          reviewId: item.reviewId,
          id: index + 1, // 행 번호 추가 (1부터 시작)
          userName: item.name,
          contents: item.contents, // 예시 내용
          createdAt: item.createdAt,
          score: item.score,
          replyStatus: item.comment,
          comment: item.comment === null ? "" : item.comment.contents,
        }));
        setReviewDatas(formattedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openCommentModal = reviewId => {
    setCommentModal(true);
    setReviewIds(reviewId);
    navigate("/expert/review-center/reviewview");
  };
  // const commentBoxs = () => {
  //   console.log(commentBox);
  //   if (commentBox === false) {
  //     setCommentBox(true);

  //     // getComment(item.id);
  //   } else {
  //     setCommentBox(false);
  //   }
  // };
  const commentBoxs = reviewId => {
    setReviewIds(reviewId);
    navigate("/expert/review-center/reviewview");
  };

  // const getComment = async () => {
  //   try {
  //     const res = await axios.get(`/api/review/commnet?reviewId=${reviewIds}`);
  //     setCommentData(res.resultData);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  useEffect(() => {
    reviewData();
  }, []);
  const toggleSort = () => {
    const sortedData = [...reviewDatas].sort(
      (a, b) =>
        isSorted
          ? new Date(a.createdAt) - new Date(b.createdAt) // 오래된 순
          : new Date(b.createdAt) - new Date(a.createdAt), // 최신순
    );

    setReviewDatas(sortedData);
    setIsSorted(!isSorted);
  };
  const scoreSort = () => {
    const scoredData = [...reviewDatas].sort(
      (a, b) =>
        isScored
          ? parseFloat(a.score) - parseFloat(b.score) // 낮은 점수 → 높은 점수 (오름차순)
          : parseFloat(b.score) - parseFloat(a.score), // 높은 점수 → 낮은 점수 (내림차순)
    );

    setReviewDatas(scoredData);
    setIsScored(!isScored);
  };
  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 10 }}>
        <button onClick={toggleSort}>
          {isSorted ? "오래된 순 정렬" : "최신순 정렬"}
        </button>
        /
        <button onClick={scoreSort}>
          {isScored ? "평점 낮은 순" : "평점 높은 순"}
        </button>
      </div>
      <div>
        <table className="table-container">
          {/* 첫 번째 행 (테이블 헤더) */}
          <thead>
            <tr>
              <th>번호</th>
              <th>이름</th>
              <th>내용</th>
              <th>댓글 등록시간</th>
              <th>평점</th>
              <th>답글 여부</th>
            </tr>
          </thead>

          {/* 두 번째 행부터 불러온 데이터 매핑 */}
          <tbody>
            {reviewDatas.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.userName}</td>
                <td>{item.contents}</td>
                <td>{item.createdAt}</td>
                <td>{item.score}</td>
                <td>
                  {item.replyStatus === null ? (
                    <button
                      onClick={() => {
                        openCommentModal(item.reviewId);
                      }}
                    >
                      🔴
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        commentBoxs(item.reviewId);
                      }}
                    >
                      🔵
                    </button>
                  )}
                </td>
                {/* {commentBox[item.reviewId] && (
                  <tr>
                    <td colSpan="6" style={{ backgroundColor: "#f9f9f9" }}>
                      <div
                        style={{ padding: "10px", border: "1px solid #ddd" }}
                      >
                        {item.comment}
                      </div>
                    </td>
                  </tr>
                )} */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Index;
