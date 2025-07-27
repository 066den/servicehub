import Button from '../ui/Button'
import './ProfileHero.scss'

const ProfileHero = () => {
	return (
		<section className='profile-hero'>
			<div className='container'>
				<div className='hero-content'>
					<div className='profile-avatar-large'>
						ОП
						<div className='avatar-upload' title='Змінити фото'>
							📷
						</div>
					</div>

					<div className='profile-info'>
						<h1>Олексій Петренко</h1>

						<div className='profile-meta'>
							<div className='meta-item'>📍 Київ, Україна</div>
							<div className='meta-item'>📅 На платформі з 2023 року</div>
							<div className='meta-item'>✅ Підтверджений профіль</div>
						</div>

						<div className='profile-stats'>
							<div className='stat-item'>
								<span className='stat-number'>24</span>
								<span className='stat-label'>Замовлень</span>
							</div>
							<div className='stat-item'>
								<span className='stat-number'>8</span>
								<span className='stat-label'>Відгуків</span>
							</div>
							<div className='stat-item'>
								<span className='stat-number'>12</span>
								<span className='stat-label'>Обраних</span>
							</div>
						</div>
					</div>

					<div className='btn-column'>
						<Button color='white'>✏️ Редагувати профіль</Button>
						<Button color='outline-white'>⚙️ Налаштування</Button>
					</div>
				</div>
			</div>
		</section>
	)
}

export default ProfileHero
