import * as React from 'react'

import { fetchQuizQuestions } from '../API'
// Components
import QuestionCard from '../components/QuestionCard'
// Types
import { QuestionState, Difficulty } from '../API'
// Styles
import styles from './Quiz.module.scss'

export type AnswerObject = {
  question: string
  answer: string
  correct: boolean
  correctAnswer: string
}

type IStateProps = {
  loading: boolean
  number: number
  score: number
  gameOver: boolean
  questions: QuestionState[]
  userAnswers: AnswerObject[]
  error: string | null
}

const TOTAL_QUESTIONS = 10



export const Quiz = () => {
  const [state, setState] = React.useState<IStateProps>({
    loading: false,
    number: 0,
    score: 0,
    gameOver: true,
    questions: [],
    userAnswers: [],
    error: null,
  })

  const { error } = state
  React.useEffect(() => {
    if (error) {
      throw new Error(error)
    }
  }, [error])

  const startTrivia = async () => {
    setState({ ...state, loading: true })

    const newQuestions = await fetchQuizQuestions(
      TOTAL_QUESTIONS,
      Difficulty.EASY,
    )

    if (!newQuestions.length) {
      setState({ ...state, error: 'I am error' })
    }

    setState({
      ...state,
      gameOver: false,
      questions: newQuestions,
      score: 0,
      loading: false,
      number: 0,
      userAnswers: [],
    })
  }

  const checkAnswer = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!state.gameOver) {
      // Users answer
      const answer = e.currentTarget.value

      // Check answer against correct answer
      const correct = state.questions[state.number].correct_answer === answer
      e.currentTarget.classList.add(correct ? 'correct' : 'incorrect')

      // Save answer in the array for user answers
      const answerObject = {
        question: state.questions[state.number].question,
        answer,
        correct,
        correctAnswer: state.questions[state.number].correct_answer,
      }

      setState({
        ...state,
        userAnswers: [...state.userAnswers, answerObject],
        score: correct ? state.score + 1 : state.score,
      })
    }
  }

  const nextQuestion = () => {
    // Move on to the next question if not the last question
    const nextQuestion = state.number + 1

    if (nextQuestion === TOTAL_QUESTIONS) {
      setState({ ...state, gameOver: true })
    } else {
      setState({ ...state, number: nextQuestion })
    }
  }
  return (
    <>
      {state.gameOver || state.userAnswers.length === TOTAL_QUESTIONS ? (
        <button className={styles.start} onClick={startTrivia}>
          START
        </button>
      ) : null}

      {!state.gameOver ? (
        <p className={styles.score}>Score: {state.score}</p>
      ) : null}

      {state.loading && <p>Loading Questions...</p>}

      
        {!state.loading && !state.gameOver && (
          <QuestionCard
            questionNumber={state.number + 1}
            totalQuestions={TOTAL_QUESTIONS}
            question={state.questions[state.number].question}
            answers={state.questions[state.number].answers}
            userAnswer={
              state.userAnswers ? state.userAnswers[state.number] : undefined
            }
            callback={checkAnswer}
          />
        )}
      

      {!state.gameOver &&
      state.userAnswers.length === state.number + 1 &&
      state.number !== TOTAL_QUESTIONS - 1 ? (
        <button className={styles.next} onClick={nextQuestion}>
          NEXT QUESTION
        </button>
      ) : null}
    </>
  )
}