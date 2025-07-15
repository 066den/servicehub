const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	phone: { type: DataTypes.STRING, unique: true, allowNull: false },
	phoneNormalized: { type: DataTypes.STRING, unique: true },
	email: { type: DataTypes.STRING, unique: true },
	firstName: { type: DataTypes.STRING, allowNull: false },
	lastName: { type: DataTypes.STRING },
	avatar: { type: DataTypes.STRING },
	address: { type: DataTypes.JSONB },
	role: { type: DataTypes.STRING, defaultValue: 'CLIENT' },
	isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
	lastLoginAt: { type: DataTypes.DATE },
	isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
	isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
	notificationPreferences: {
		type: DataTypes.JSONB,
		defaultValue: {
			email: true,
			sms: true,
			push: true,
		},
	},
	createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})

const VerificationCode = sequelize.define('verification_code', {
	id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
	phone: { type: DataTypes.STRING(15), allowNull: false },
	code: { type: DataTypes.STRING(6), allowNull: false },
	attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
	maxAttempts: { type: DataTypes.INTEGER, defaultValue: 3 },
	isUsed: { type: DataTypes.BOOLEAN, defaultValue: false },
	expiresAt: { type: DataTypes.DATE, allowNull: false },
	usedAt: { type: DataTypes.DATE },
	ipAddress: { type: DataTypes.STRING(45) },
})

const Session = sequelize.define('session', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	userId: {
		type: DataTypes.INTEGER,
		references: { model: User, key: 'id' },
		field: 'user_id',
	},
	token: { type: DataTypes.STRING, allowNull: false },
	refreshToken: {
		type: DataTypes.STRING,
		allowNull: false,
		field: 'refresh_token',
	},
	deviceInfo: { type: DataTypes.TEXT, field: 'device_info' },
	ipAddress: { type: DataTypes.STRING(45), field: 'ip_address' },
	userAgent: { type: DataTypes.TEXT, field: 'user_agent' },
	isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
	expiresAt: { type: DataTypes.DATE, allowNull: false },
	lastActivityAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW,
		field: 'last_activity_at',
	},
	deactivatedReason: {
		type: DataTypes.ENUM(
			'manual_logout',
			'session_limit_exceeded',
			'replaced_by_new_session',
			'expired',
			'security_logout'
		),
		field: 'deactivated_reason',
	},
	createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})

const Provider = sequelize.define('provider', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	userId: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } },
	businesName: { type: DataTypes.STRING, allowNull: false },
	description: { type: DataTypes.STRING },
	status: { type: DataTypes.STRING, defaultValue: 'PENDING' },
	rating: { type: DataTypes.FLOAT, defaultValue: 0 },
	reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
	workingHours: { type: DataTypes.JSONB },
	serviceAreas: { type: DataTypes.JSONB },
	documents: { type: DataTypes.JSONB },
	isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
	isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
	subscriptionPlan: { type: DataTypes.STRING, defaultValue: 'BASIC' },
	subscriptionExpiresAt: { type: DataTypes.DATE },
	location: { type: DataTypes.JSONB },
	instagram: {
		type: DataTypes.STRING,
		defaultValue: 'https://www.instagram.com',
	},
	facebook: {
		type: DataTypes.STRING,
		defaultValue: 'https://www.facebook.com',
	},
	createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})

const Category = sequelize.define('category', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	name: { type: DataTypes.STRING },
})

const Type = sequelize.define('type', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	name: { type: DataTypes.STRING },
})

const CategoryType = sequelize.define('categoryType', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
})

const Service = sequelize.define('service', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	providerId: {
		type: DataTypes.INTEGER,
		references: { model: Provider, key: 'id' },
	},
	name: { type: DataTypes.STRING, allowNull: false },
	description: { type: DataTypes.STRING },
	categoryId: {
		type: DataTypes.INTEGER,
		references: { model: Category, key: 'id' },
		allowNull: false,
	},
	typeId: {
		type: DataTypes.INTEGER,
		references: { model: Type, key: 'id' },
		allowNull: false,
	},
	price: { type: DataTypes.FLOAT },
	duration: { type: DataTypes.INTEGER },
	pricingOptions: { type: DataTypes.JSONB },
	tags: { type: DataTypes.ARRAY(DataTypes.STRING) },
	photos: { type: DataTypes.ARRAY(DataTypes.STRING) },
	requirements: { type: DataTypes.JSONB },
	isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
	isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
	createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})

const Order = sequelize.define('order', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	clientId: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } },
	providerId: {
		type: DataTypes.INTEGER,
		references: { model: Provider, key: 'id' },
	},
	serviceId: {
		type: DataTypes.INTEGER,
		references: { model: Service, key: 'id' },
	},
	status: { type: DataTypes.STRING, defaultValue: 'CREATED' },
	scheduledAt: { type: DataTypes.DATE },
	startedAt: { type: DataTypes.DATE },
	completedAt: { type: DataTypes.DATE },
	serviceDetails: { type: DataTypes.JSONB },
	location: { type: DataTypes.JSONB },
	clientNotes: { type: DataTypes.STRING },
	providerNotes: { type: DataTypes.STRING },
	totalAmount: { type: DataTypes.FLOAT },
	platformFee: { type: DataTypes.FLOAT },
	paymentStatus: { type: DataTypes.STRING, defaultValue: 'PENDING' },
	photos: { type: DataTypes.ARRAY(DataTypes.STRING) },
	createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})

const Review = sequelize.define('review', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	orderId: { type: DataTypes.INTEGER, references: { model: Order, key: 'id' } },
	clientId: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } },
	providerId: {
		type: DataTypes.INTEGER,
		references: { model: Provider, key: 'id' },
	},
	rating: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
	comment: { type: DataTypes.STRING },
	photos: { type: DataTypes.ARRAY(DataTypes.STRING) },
	response: { type: DataTypes.STRING },
	createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})

const SmsLog = sequelize.define('smsLog', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	phone: { type: DataTypes.STRING, allowNull: false },
	message: { type: DataTypes.STRING, allowNull: false },
	provider: { type: DataTypes.STRING(50) },
	providerMessageId: {
		type: DataTypes.STRING(255),
		field: 'provider_message_id',
	},
	status: {
		type: DataTypes.ENUM(
			'sent',
			'failed',
			'pending',
			'delivered',
			'expired',
			'rejected'
		),
		defaultValue: 'pending',
	},
	cost: { type: DataTypes.DECIMAL(10, 4), defaultValue: 0.0 },
	errorMessage: { type: DataTypes.STRING },
	sentAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	deliveredAt: { type: DataTypes.DATE },
	testMode: { type: DataTypes.BOOLEAN, defaultValue: false },
	ipAddress: { type: DataTypes.STRING, allowNull: false },
	createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})

User.hasMany(Order, { foreignKey: 'clientId' })
Order.belongsTo(User, { foreignKey: 'clientId' })

User.hasMany(Session, { foreignKey: 'userId' })
Session.belongsTo(User, { foreignKey: 'userId' })

Provider.hasMany(Order, { foreignKey: 'providerId' })
Order.belongsTo(Provider, { foreignKey: 'providerId' })

User.hasMany(Review, { foreignKey: 'clientId' })
Review.belongsTo(User, { foreignKey: 'clientId' })

Provider.hasMany(Review, { foreignKey: 'providerId' })
Review.belongsTo(Provider, { foreignKey: 'providerId' })

Order.hasMany(Review, { foreignKey: 'orderId' })
Review.belongsTo(Order, { foreignKey: 'orderId' })

Category.hasMany(Service, { foreignKey: 'categoryId' })
Service.belongsTo(Category, { foreignKey: 'categoryId' })

Type.hasMany(Service, { foreignKey: 'typeId' })
Service.belongsTo(Type, { foreignKey: 'typeId' })

Category.belongsToMany(Type, {
	through: CategoryType,
	foreignKey: 'categoryId',
})
Type.belongsToMany(Category, { through: CategoryType, foreignKey: 'typeId' })

module.exports = {
	User,
	Provider,
	Category,
	Type,
	Service,
	Order,
	Review,
	Session,
	VerificationCode,
	SmsLog,
}
