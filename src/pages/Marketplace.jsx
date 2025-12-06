import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Sparkles, RefreshCw } from 'lucide-react';

const Marketplace = () => {
    const { user } = useAuth();
    const [dogName, setDogName] = useState('your pup');
    const [bones, setBones] = useState(0);
    const [deals, setDeals] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('store'); // 'store' | 'hunter'
    const [redeemModal, setRedeemModal] = useState(null); // { item, code, type }

    useEffect(() => {
        if (user) {
            fetchData();
            fetchCoupons();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Get Profile (Dog Name)
            const { data: profile } = await supabase
                .from('profiles')
                .select('dog_name')
                .eq('id', user.id)
                .single();

            if (profile?.dog_name) setDogName(profile.dog_name);

            // 2. Get Bone Balance
            const { data: wallet } = await supabase
                .from('bone_wallets')
                .select('balance')
                .eq('user_id', user.id)
                .single();

            if (wallet) setBones(wallet.balance);

            // 3. Get Store Deals
            const { data: dealsData } = await supabase
                .from('store_deals')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (dealsData) setDeals(dealsData);

        } catch (error) {
            console.error('Error fetching marketplace data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCoupons = async () => {
        try {
            const { data, error } = await supabase
                .from('scraped_coupons')
                .select('*')
                .eq('is_redeemed', false)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCoupons(data || []);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        }
    };

    const handleRedeemDeal = async (deal) => {
        if (bones < deal.bones_cost) {
            alert(`You need ${deal.bones_cost} bones, but you only have ${bones}. Keep walking! 🐕`);
            return;
        }

        if (!window.confirm(`Redeem "${deal.title}" for ${deal.bones_cost} bones?`)) return;

        try {
            // 1. Deduct bones (optimistic update)
            setBones(prev => prev - deal.bones_cost);

            // 2. Record Transaction
            const { error: txError } = await supabase
                .from('bone_transactions')
                .insert({
                    user_id: user.id,
                    amount: -deal.bones_cost,
                    type: 'store_redeem',
                    meta: { deal_id: deal.id, deal_title: deal.title }
                });

            if (txError) throw txError;

            // 3. Update Wallet Balance in DB
            const { error: walletError } = await supabase
                .from('bone_wallets')
                .update({ balance: bones - deal.bones_cost })
                .eq('user_id', user.id);

            if (walletError) throw walletError;

            // 4. Show Success Modal
            setRedeemModal({
                item: deal,
                code: 'WOOF' + Math.floor(1000 + Math.random() * 9000),
                type: 'deal'
            });

        } catch (error) {
            console.error('Error redeeming deal:', error);
            alert('Something went wrong. Please try again.');
            setBones(prev => prev + deal.bones_cost); // Rollback
        }
    };

    const handleRedeemCoupon = async (coupon) => {
        if (bones < coupon.bones_cost) {
            alert(`You need ${coupon.bones_cost} bones. 🐕`);
            return;
        }

        if (!window.confirm(`Unlock ${coupon.discount_value} at ${coupon.store_name} for ${coupon.bones_cost} bones?`)) return;

        try {
            // Optimistic update
            setBones(prev => prev - coupon.bones_cost);

            // 1. Deduct bones
            const { error: walletError } = await supabase
                .from('bone_wallets')
                .update({ balance: bones - coupon.bones_cost })
                .eq('user_id', user.id);

            if (walletError) throw walletError;

            // 2. Mark coupon as redeemed
            const { data: redeemedCoupon, error: couponError } = await supabase
                .from('scraped_coupons')
                .update({
                    is_redeemed: true,
                    redeemed_by: user.id
                })
                .eq('id', coupon.id)
                .select()
                .single();

            if (couponError) throw couponError;

            // 3. Record transaction
            await supabase
                .from('bone_transactions')
                .insert({
                    user_id: user.id,
                    amount: -coupon.bones_cost,
                    type: 'coupon_redeem',
                    meta: { coupon_id: coupon.id, store: coupon.store_name }
                });

            // Remove from list
            setCoupons(prev => prev.filter(c => c.id !== coupon.id));

            setRedeemModal({
                item: redeemedCoupon,
                code: redeemedCoupon.code,
                type: 'coupon'
            });

        } catch (error) {
            console.error('Error redeeming coupon:', error);
            alert('Redemption failed.');
            setBones(prev => prev + coupon.bones_cost);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            <div style={{ padding: '20px 0 10px' }}>
                <h1 style={{ color: 'var(--color-primary)' }}>Marketplace</h1>
                <p className="text-muted">Shop for {dogName}, earn rewards.</p>
            </div>

            {/* Bone Balance Banner */}
            <Card style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                <p className="text-sm" style={{ opacity: 0.9 }}>Your Bone Balance</p>
                <h2 style={{ fontSize: '2.5rem', margin: '5px 0' }}>{bones} 🦴</h2>
                <p className="text-sm" style={{ opacity: 0.8 }}>Use bones for discounts!</p>
            </Card>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <Button
                    variant={activeTab === 'store' ? 'primary' : 'ghost'}
                    onClick={() => setActiveTab('store')}
                    style={{ flex: 1 }}
                >
                    Store Deals
                </Button>
                <Button
                    variant={activeTab === 'hunter' ? 'primary' : 'ghost'}
                    onClick={() => setActiveTab('hunter')}
                    style={{ flex: 1 }}
                >
                    Coupon Hunter 🕵️‍♂️
                </Button>
            </div>

            {activeTab === 'store' ? (
                /* Featured Deals */
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '15px' }}>Featured Deals</h3>
                    {loading ? (
                        <p className="text-center text-muted">Loading deals...</p>
                    ) : deals.length === 0 ? (
                        <p className="text-center text-muted">No deals available right now.</p>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '15px'
                        }}>
                            {deals.map(deal => (
                                <ProductCard
                                    key={deal.id}
                                    name={deal.title}
                                    price={deal.price_usd}
                                    boneDiscount={deal.bones_cost}
                                    image={deal.image_url}
                                    onBuy={() => handleRedeemDeal(deal)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* Coupon Hunter */
                <div className="animate-fade-in">
                    <Card style={{ marginBottom: '20px', textAlign: 'center', border: '1px dashed var(--color-primary)' }}>
                        <h3 style={{ marginBottom: '10px' }}>Freshly Hunted Coupons</h3>
                        <p className="text-muted" style={{ marginBottom: '15px' }}>
                            Our AI agent updates this list every 3 hours.
                        </p>
                        <Button
                            variant="secondary"
                            onClick={fetchCoupons}
                            size="sm"
                        >
                            <RefreshCw size={14} style={{ marginRight: '6px' }} /> Refresh
                        </Button>
                    </Card>

                    {coupons.length === 0 ? (
                        <p className="text-center text-muted">No coupons found yet. Check back later!</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {coupons.map(coupon => (
                                <Card key={coupon.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--color-primary)', marginBottom: '4px' }}>{coupon.store_name}</h4>
                                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{coupon.discount_value}</p>
                                        <p className="text-xs text-muted">{coupon.description}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{coupon.bones_cost} 🦴</p>
                                        <Button size="sm" onClick={() => handleRedeemCoupon(coupon)}>Unlock</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Redemption Modal */}
            {redeemModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '20px'
                }}>
                    <Card className="animate-fade-in" style={{ width: '100%', maxWidth: '350px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
                        <h2 style={{ color: 'var(--color-primary)' }}>Redeemed!</h2>
                        <p className="text-muted" style={{ marginBottom: '20px' }}>
                            You unlocked <b>{redeemModal.type === 'deal' ? redeemModal.item.title : redeemModal.item.discount_value}</b>
                        </p>

                        <div style={{
                            background: 'var(--color-bg)',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: '2px dashed var(--color-border)'
                        }}>
                            <p className="text-sm text-muted">Use this code at checkout:</p>
                            <h3 style={{ fontSize: '1.5rem', letterSpacing: '2px', margin: '5px 0' }}>
                                {redeemModal.code}
                            </h3>
                        </div>

                        <Button fullWidth onClick={() => setRedeemModal(null)}>Done</Button>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Marketplace;
