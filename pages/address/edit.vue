<template>
	<view class="page">
		<!-- 联系人 -->
		<view class="card">
			<view class="form-row">
				<text class="label">联系人</text>
				<input class="input" v-model="form.consignee" placeholder="请填写收货人姓名"
					placeholder-class="ph" />
			</view>
			<view class="form-row">
				<text class="label">手机号</text>
				<input class="input" v-model="form.phone" type="number" maxlength="11"
					placeholder="请填写收货人手机号" placeholder-class="ph" />
			</view>
			<view class="form-row">
				<text class="label">性别</text>
				<view class="chips">
					<view class="chip" :class="{ active: form.sex === '1' }" @click="form.sex = '1'">先生</view>
					<view class="chip" :class="{ active: form.sex === '2' }" @click="form.sex = '2'">女士</view>
				</view>
			</view>
		</view>

		<!-- 地址 -->
		<view class="card">
			<view class="form-row">
				<text class="label">所在地区</text>
				<picker class="picker" mode="region" @change="onRegionChange">
					<view class="picker-text" :class="{ ph: !form.provinceName }">
						{{ form.provinceName ? regionText : '请选择省 / 市 / 区' }}
					</view>
				</picker>
			</view>
			<view class="form-row">
				<text class="label">详细地址</text>
				<input class="input" v-model="form.detail" placeholder="街道、小区、门牌号等"
					placeholder-class="ph" />
			</view>
		</view>

		<!-- 标签 / 默认 -->
		<view class="card">
			<view class="form-row">
				<text class="label">标签</text>
				<view class="chips">
					<view class="chip" v-for="item in labels" :key="item"
						:class="{ active: form.label === item }"
						@click="toggleLabel(item)">{{ item }}</view>
				</view>
			</view>
			<view class="form-row">
				<text class="label">设为默认地址</text>
				<switch :checked="form.isDefault === 1" color="#ffc200"
					@change="form.isDefault = $event.detail.value ? 1 : 0" />
			</view>
		</view>

		<!-- 保存 -->
		<view class="save-bar">
			<view class="save-btn" @click="onSave">保存</view>
		</view>
	</view>
</template>

<script>
	import { addAddress, updateAddress, getAddressById } from '../../api/address.js'

	// 空表单模板：省市区名称/码成对维护（picker 换选时一起换）
	const emptyForm = () => ({
		id: null,
		consignee: '',
		phone: '',
		sex: '1',                 // 后端约定字符串：1 男 2 女
		provinceName: '',
		provinceCode: '',
		cityName: '',
		cityCode: '',
		districtName: '',
		districtCode: '',
		detail: '',
		label: '',                // 家/公司/学校，可不选
		isDefault: 0
	})

	export default {
		data() {
			return {
				isEdit: false,
				labels: ['家', '公司', '学校'],
				form: emptyForm(),
				saving: false
			}
		},
		computed: {
			regionText() {
				return `${this.form.provinceName} ${this.form.cityName} ${this.form.districtName}`
			}
		},
		methods: {
			// 微信地区选择器：value 是名称数组，code 是对应行政区划码数组
			onRegionChange(e) {
				const [provinceName = '', cityName = '', districtName = ''] = e.detail.value || []
				const [provinceCode = '', cityCode = '', districtCode = ''] = e.detail.code || []
				Object.assign(this.form, { provinceName, cityName, districtName, provinceCode, cityCode, districtCode })
			},
			// 标签可反选（再点一次取消）
			toggleLabel(item) {
				this.form.label = this.form.label === item ? '' : item
			},
			validate() {
				if (!this.form.consignee.trim()) return '请填写联系人'
				if (!/^1[3-9]\d{9}$/.test(this.form.phone)) return '手机号格式不正确'
				if (!this.form.provinceName) return '请选择所在地区'
				if (!this.form.detail.trim()) return '请填写详细地址'
				return ''
			},
			async onSave() {
				if (this.saving) return                 // 防连点
				const err = this.validate()
				if (err) {
					uni.showToast({ title: err, icon: 'none' })
					return
				}
				this.saving = true
				try {
					// 写接口成功 data 是提示字符串、失败为 null；失败不返回，避免用户白填一版表单
					const ok = this.isEdit ? await updateAddress(this.form) : await addAddress(this.form)
					if (!ok) return
					uni.showToast({ title: '保存成功', icon: 'success' })
					setTimeout(() => uni.navigateBack(), 500)
				} finally {
					this.saving = false
				}
			}
		},
		async onLoad(options) {
			if (!options.id) return                    // 无 id = 新增模式
			this.isEdit = true
			uni.setNavigationBarTitle({ title: '编辑地址' })
			const detail = await getAddressById(options.id)
			if (!detail) return                       // 拉失败保持空表单，用户可重进
			// 只挑表单字段回显，不带出 createTime 之类的杂字段
			const picked = (({ id, consignee, phone, sex, provinceName, provinceCode, cityName, cityCode, districtName, districtCode, detail, label, isDefault }) =>
				({ id, consignee, phone, sex, provinceName, provinceCode, cityName, cityCode, districtName, districtCode, detail, label, isDefault }))(detail)
			Object.assign(this.form, picked, {
				sex: String(picked.sex || '1'),        // 后端字符串枚举，防历史数据是数字
				label: picked.label || '',
				isDefault: Number(picked.isDefault || 0)
			})
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100%;
		box-sizing: border-box;
		padding: 20rpx 20rpx calc(160rpx + env(safe-area-inset-bottom));   // 底部让位保存按钮
		background-color: $bg-page;

		.card {
			background-color: #fff;
			border-radius: 16rpx;
			padding: 0 24rpx;
			margin-bottom: 20rpx;
		}

		.form-row {
			display: flex;
			align-items: center;
			gap: 24rpx;
			min-height: 104rpx;

			& + .form-row {
				border-top: 1rpx solid $line-color;
			}

			.label {
				width: 160rpx;
				flex-shrink: 0;
				font-size: $font-sm;
				color: $text-main;
			}

			.input {
				flex: 1;
				min-width: 0;
				font-size: $font-sm;
				color: $text-main;
			}

			.picker {
				flex: 1;
				min-width: 0;

				.picker-text {
					font-size: $font-sm;
					color: $text-main;
				}
			}

			.chips {
				display: flex;
				gap: 20rpx;

				.chip {
					padding: 8rpx 32rpx;
					border-radius: 999rpx;
					background-color: $bg-cat;
					color: $text-sub;
					font-size: $font-sm;
				}

				.chip.active {
					background: $brand-gradient;
					color: #1a1a1a;
					font-weight: 600;
				}
			}
		}
	}

	/* 占位文字色（picker 里手写的 view 也复用这个类） */
	.ph {
		color: $text-placeholder;
	}

	/* ---- 底部保存按钮 ---- */
	.save-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 20rpx 20rpx calc(20rpx + env(safe-area-inset-bottom));
		background-color: #fff;

		.save-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 88rpx;
			border-radius: 999rpx;
			background: $brand-gradient;
			color: #1a1a1a;
			font-size: $font-md;
			font-weight: 600;
		}
	}
</style>
