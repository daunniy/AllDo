import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import './KoreanEnglishTranslator.css';  // CSS 파일을 import

const KoreanEnglishTranslator = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isKoreanToEnglish, setIsKoreanToEnglish] = useState(true);
  const [error, setError] = useState('');

  const GOOGLE_API_KEY = 'AIzaSyCTMB2jPE0E7_0QGvwfE8SSxngS0aI5T0A'; // 실제 API 키로 교체하세요.

  // 번역 API 호출 함수
  // 번역 API 호출 함수
const translateWithGoogle = async (text, sourceLang, targetLang) => {
  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}&q=${encodeURIComponent(
        text
      )}&source=${sourceLang}&target=${targetLang}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Translate API error:', errorData);
      throw new Error(
        `Google Translate API error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    const encodedText = data.data.translations[0].translatedText;

    // HTML 엔터티 디코딩
    const parser = new DOMParser();
    const decodedText = parser.parseFromString(encodedText, 'text/html').body
      .textContent;

    return decodedText; // 디코딩된 텍스트 반환
  } catch (error) {
    throw new Error(`Google Translate error: ${error.message}`);
  }
};


  // 번역 방향 전환
  const toggleDirection = () => {
    setIsKoreanToEnglish((prevState) => !prevState);
    setOutputText(''); // 번역 방향 전환 시 출력 텍스트 초기화
  };

  // 입력 텍스트가 변경될 때마다 자동으로 번역 실행
  const handleInputChange = async (e) => {
    const text = e.target.value;
    setInputText(text); // 입력된 텍스트 업데이트

    if (!text.trim()) {
      setOutputText(''); // 텍스트가 비어있으면 출력 텍스트 초기화
      setError('');
      return;
    }

    setError('');

    try {
      const sourceLang = isKoreanToEnglish ? 'ko' : 'en';
      const targetLang = isKoreanToEnglish ? 'en' : 'ko';
      const translatedText = await translateWithGoogle(text, sourceLang, targetLang);
      setOutputText(translatedText);
    } catch (err) {
      setError(err.message);
    }
  };

  // 번역 버튼을 눌렀을 때 실행되는 함수
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to translate.');
      return;
    }

    setError('');

    try {
      const sourceLang = isKoreanToEnglish ? 'ko' : 'en';
      const targetLang = isKoreanToEnglish ? 'en' : 'ko';
      const translatedText = await translateWithGoogle(inputText, sourceLang, targetLang);
      setOutputText(translatedText);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="korean-english-translator">
      <h1>번역기</h1>

      {/* Input and button wrapped in a flex container */}
      <div className="input-button-container">
        {/* 입력 텍스트 */}
        <div className="mb-4">
          <label>{isKoreanToEnglish ? '한국어' : '영어'}</label>
          <textarea
            id="inputText"
            value={inputText}
            onChange={handleInputChange} // 텍스트 입력 시 자동 번역
            className="textarea"
          />
        </div>

        {/* 출력 텍스트 */}
        <div className="mb-4">
          <label>{isKoreanToEnglish ? '영어' : '한국어'}</label>
          <textarea
            id="outputText"
            value={outputText}
            readOnly
            className="textarea"
          />
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="button-container">
      <button onClick={toggleDirection} className="arrow">
        <ArrowLeftRight className="w-6 h-6" />
      </button>
      <button onClick={handleTranslate} className="translatorBtn"> 번역하기 </button>
      </div>

      {/* 오류 메시지 */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default KoreanEnglishTranslator;
