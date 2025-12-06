import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import Card from './Card';
import Button from './Button';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Plus, X } from 'lucide-react';

const PackQA = forwardRef(({ packId, isMember }, ref) => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAskModal, setShowAskModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ title: '', body: '' });
    const [submitting, setSubmitting] = useState(false);
    const [expandedQuestion, setExpandedQuestion] = useState(null); // ID of expanded question
    const [answers, setAnswers] = useState({}); // Map of questionId -> answers array
    const [newAnswer, setNewAnswer] = useState('');

    useEffect(() => {
        fetchQuestions();
    }, [packId]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('pack_questions')
                .select(`
                    *,
                    profiles:user_id (display_name, dog_name, avatar_url),
                    pack_answers (count)
                `)
                .eq('pack_id', packId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuestions(data || []);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAskQuestion = async () => {
        if (!newQuestion.title.trim()) return;

        try {
            setSubmitting(true);
            const { data, error } = await supabase
                .from('pack_questions')
                .insert({
                    pack_id: packId,
                    user_id: user.id,
                    title: newQuestion.title,
                    body: newQuestion.body
                })
                .select(`
                    *,
                    profiles:user_id (display_name, dog_name, avatar_url),
                    pack_answers (count)
                `)
                .single();

            if (error) throw error;

            setQuestions([data, ...questions]);
            setShowAskModal(false);
            setNewQuestion({ title: '', body: '' });

        } catch (error) {
            console.error('Error asking question:', error);
            alert('Failed to post question.');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleQuestion = async (questionId) => {
        if (expandedQuestion === questionId) {
            setExpandedQuestion(null);
        } else {
            setExpandedQuestion(questionId);
            if (!answers[questionId]) {
                fetchAnswers(questionId);
            }
        }
    };

    const fetchAnswers = async (questionId) => {
        try {
            const { data, error } = await supabase
                .from('pack_answers')
                .select(`
                    *,
                    profiles:user_id (display_name, dog_name, avatar_url)
                `)
                .eq('question_id', questionId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setAnswers(prev => ({ ...prev, [questionId]: data }));
        } catch (error) {
            console.error('Error fetching answers:', error);
        }
    };

    const handlePostAnswer = async (questionId) => {
        if (!newAnswer.trim()) return;

        try {
            const { data, error } = await supabase
                .from('pack_answers')
                .insert({
                    question_id: questionId,
                    user_id: user.id,
                    body: newAnswer
                })
                .select(`
                    *,
                    profiles:user_id (display_name, dog_name, avatar_url)
                `)
                .single();

            if (error) throw error;

            setAnswers(prev => ({
                ...prev,
                [questionId]: [...(prev[questionId] || []), data]
            }));
            setNewAnswer('');

        } catch (error) {
            console.error('Error posting answer:', error);
            alert('Failed to post answer.');
        }
    };

    // Expose openModal method to parent via ref
    useImperativeHandle(ref, () => ({
        openModal: () => setShowAskModal(true)
    }));

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '15px' }}>
                <h3>Community Q&A</h3>
                {isMember && (
                    <Button size="sm" onClick={() => setShowAskModal(true)}>
                        <Plus size={16} /> Ask
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="text-center text-muted">Loading questions...</div>
            ) : questions.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: '40px 0' }}>
                    <p>No questions yet. Be the first to ask! 🙋‍♂️</p>
                </div>
            ) : (
                <div className="flex-col gap-md">
                    {questions.map(q => (
                        <Card key={q.id} style={{ padding: '15px' }}>
                            <div
                                onClick={() => toggleQuestion(q.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <h4 style={{ marginBottom: '5px' }}>{q.title}</h4>
                                <div className="flex justify-between items-center text-sm text-muted">
                                    <span>by {q.profiles?.dog_name || 'Unknown'}</span>
                                    <div className="flex items-center gap-xs">
                                        <MessageCircle size={14} />
                                        <span>{q.pack_answers?.[0]?.count || 0} answers</span>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded View (Answers) */}
                            {expandedQuestion === q.id && (
                                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--color-border)' }}>
                                    <p className="text-muted" style={{ marginBottom: '15px' }}>{q.body}</p>

                                    <div className="flex-col gap-sm" style={{ marginBottom: '15px' }}>
                                        {answers[q.id]?.map(a => (
                                            <div key={a.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                                                <div className="flex justify-between items-center" style={{ marginBottom: '5px' }}>
                                                    <span className="font-bold text-sm">{a.profiles?.dog_name}</span>
                                                    <span className="text-xs text-muted">{new Date(a.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm">{a.body}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {isMember ? (
                                        <div className="flex gap-sm">
                                            <input
                                                type="text"
                                                placeholder="Write an answer..."
                                                value={newAnswer}
                                                onChange={(e) => setNewAnswer(e.target.value)}
                                                className="flex-1 p-2 rounded bg-gray-800 text-white border border-gray-700"
                                                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', padding: '8px', borderRadius: '8px' }}
                                            />
                                            <Button size="sm" onClick={() => handlePostAnswer(q.id)}>Reply</Button>
                                        </div>
                                    ) : (
                                        <p className="text-center text-sm text-muted">Join pack to answer</p>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Ask Modal */}
            {showAskModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 2000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <Card className="animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '15px' }}>
                            <h3>Ask a Question</h3>
                            <button onClick={() => setShowAskModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <input
                            type="text"
                            placeholder="Question Title"
                            value={newQuestion.title}
                            onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}
                        />
                        <textarea
                            placeholder="Details (optional)"
                            value={newQuestion.body}
                            onChange={(e) => setNewQuestion({ ...newQuestion, body: e.target.value })}
                            style={{ width: '100%', height: '100px', padding: '10px', marginBottom: '20px', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', resize: 'none' }}
                        />

                        <Button fullWidth onClick={handleAskQuestion} disabled={submitting}>
                            {submitting ? 'Posting...' : 'Ask Question'}
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
});

export default PackQA;
