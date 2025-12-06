import React from 'react';
import Card from './Card';
import Button from './Button';

const ProductCard = ({ name, price, boneDiscount, image, onBuy }) => {
    return (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
            {/* Product Image */}
            <div style={{
                height: '150px',
                background: 'var(--color-surface)',
                backgroundImage: image ? `url(${image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: 'rgba(255,255,255,0.2)'
            }}>
                {!image && '🛍️'}
            </div>

            <div style={{ padding: '12px' }}>
                <h4 style={{ marginBottom: '8px' }}>{name}</h4>

                <div className="flex justify-between items-center" style={{ marginBottom: '10px' }}>
                    <div>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${price}</span>
                        {boneDiscount && (
                            <p style={{
                                fontSize: '0.75rem',
                                color: 'var(--color-accent)',
                                marginTop: '2px'
                            }}>
                                Save {boneDiscount} 🦴
                            </p>
                        )}
                    </div>
                </div>

                <Button fullWidth onClick={onBuy} style={{ fontSize: '0.9rem' }}>
                    Buy Now
                </Button>
            </div>
        </Card>
    );
};

export default ProductCard;
