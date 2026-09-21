import QuizCompleteDoor from './door/quiz/page'

// THE FIRST SCREEN IS THE DOOR.
//
// Say It Back has no chip on home until a door has shown it, so a student cannot meet
// the feature on home — they meet it at the end of something else they were already
// doing. Opening the prototype on home meant opening it one screen after its own
// beginning, on a screen where the thing being demonstrated is by definition absent.
//
// This re-exports the door rather than duplicating it: "/" and "/door/quiz" are the
// same screen, so there is one file to change and no chance of the two drifting.
// Baseline home is at /home.

export default QuizCompleteDoor
