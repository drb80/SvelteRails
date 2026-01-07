class CreateItems < ActiveRecord::Migration[8.0]
  def change
    create_table :items do |t|
      t.string :what
      t.date :when

      t.timestamps
    end
  end
end
